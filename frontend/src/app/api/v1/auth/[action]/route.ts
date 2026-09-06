import { NextRequest, NextResponse } from 'next/server';
import { AuthStore } from '@/lib/auth-store';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendTwoFactorOtpEmail 
} from '@/lib/resend-mailer';

function getSessionFromRequest(req: NextRequest) {
  const sessionId = req.cookies.get('sanjeevni_session_id')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');
  if (!sessionId) return null;
  return AuthStore.findSessionById(sessionId);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  try {
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // 1. REGISTER
    if (action === 'register') {
      const body = await req.json();
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const existingUser = AuthStore.findUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists with this email address' }, { status: 400 });
      }

      const newUser = AuthStore.createUser(name, email, password);
      const session = AuthStore.createSession(newUser.id, userAgent, ipAddress);

      // Generate Real Verification Code
      const verification = AuthStore.createVerificationCode(newUser.id, newUser.email, 'EMAIL_VERIFICATION', 45);
      const verificationUrl = `${origin}/confirm-account?code=${verification.code}&email=${encodeURIComponent(newUser.email)}`;

      // Dispatch Real Email via Resend
      const emailResult = await sendVerificationEmail(newUser.email, newUser.name, verification.code, verificationUrl);
      console.log(`[Auth Register] Dispatched Resend email to ${newUser.email}:`, emailResult);

      const res = NextResponse.json({
        message: 'Account created! A confirmation code has been dispatched to your email.',
        user: AuthStore.sanitizeUser(newUser),
        sessionId: session.id,
        verificationCode: verification.code,
        emailSent: emailResult.success,
      }, { status: 201 });

      res.cookies.set('sanjeevni_session_id', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return res;
    }

    // 2. VERIFY EMAIL
    if (action === 'verify-email') {
      const body = await req.json();
      const { code, email } = body;

      if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }

      const verifyResult = AuthStore.verifyEmailCode(code, email);
      if (!verifyResult.success || !verifyResult.user) {
        return NextResponse.json({ error: verifyResult.error || 'Invalid or expired confirmation code' }, { status: 400 });
      }

      // Establish session
      const session = AuthStore.createSession(verifyResult.user.id, userAgent, ipAddress);
      const res = NextResponse.json({
        message: 'Email verified successfully! Welcome to Sanjeevni OS.',
        user: AuthStore.sanitizeUser(verifyResult.user),
        sessionId: session.id,
      });

      res.cookies.set('sanjeevni_session_id', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return res;
    }

    // 3. RESEND VERIFICATION CODE
    if (action === 'resend-verification') {
      const body = await req.json();
      const { email } = body;

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const user = AuthStore.findUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
      }

      const verification = AuthStore.createVerificationCode(user.id, user.email, 'EMAIL_VERIFICATION', 45);
      const verificationUrl = `${origin}/confirm-account?code=${verification.code}&email=${encodeURIComponent(user.email)}`;

      const emailResult = await sendVerificationEmail(user.email, user.name, verification.code, verificationUrl);

      return NextResponse.json({
        message: 'A fresh verification code has been dispatched to your email.',
        emailSent: emailResult.success,
      });
    }

    // 4. FORGOT PASSWORD (Request Reset Link)
    if (action === 'forgot-password') {
      const body = await req.json();
      const { email } = body;

      if (!email) {
        return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
      }

      const user = AuthStore.findUserByEmail(email);
      if (!user) {
        // Return 200 for security to avoid email enumeration
        return NextResponse.json({
          message: 'If an account exists with this email, a password reset link has been dispatched.',
        });
      }

      const reset = AuthStore.createVerificationCode(user.id, user.email, 'PASSWORD_RESET', 30);
      const resetUrl = `${origin}/reset-password?code=${reset.code}&email=${encodeURIComponent(user.email)}`;

      const emailResult = await sendPasswordResetEmail(user.email, user.name, reset.code, resetUrl);
      console.log(`[Forgot Password] Resend email dispatched to ${user.email}:`, emailResult);
      console.log(`\n======================================================`);
      console.log(`🔑 [PASSWORD RESET CODE] for ${user.email}: ${reset.code}`);
      console.log(`🔗 [DIRECT RESET URL]: ${resetUrl}`);
      if (!emailResult.success) {
        console.log(`⚠️  [MAILER NOTICE]: Resend API failed (${emailResult.error}). Use the reset code or direct URL above.`);
      }
      console.log(`======================================================\n`);

      return NextResponse.json({
        message: 'A password reset link has been dispatched to your email.',
        emailSent: emailResult.success,
        devCode: !emailResult.success || process.env.NODE_ENV !== 'production' ? reset.code : undefined,
        resetUrl: !emailResult.success || process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
      });
    }

    // 5. RESET PASSWORD
    if (action === 'reset-password') {
      const body = await req.json();
      const { code, password } = body;

      if (!code || !password) {
        return NextResponse.json({ error: 'Reset code and new password are required' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const resetResult = AuthStore.resetPasswordWithCode(code, password);
      if (!resetResult.success || !resetResult.user) {
        return NextResponse.json({ error: resetResult.error || 'Invalid or expired reset code' }, { status: 400 });
      }

      // Create new session for updated user
      const session = AuthStore.createSession(resetResult.user.id, userAgent, ipAddress);
      const res = NextResponse.json({
        message: 'Password reset successfully. You are now logged in.',
        user: AuthStore.sanitizeUser(resetResult.user),
        sessionId: session.id,
      });

      res.cookies.set('sanjeevni_session_id', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return res;
    }

    // 6. LOGIN
    if (action === 'login') {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = AuthStore.validateCredentials(email, password);
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check if 2FA is required
      if (user.userPreferences.enable2FA) {
        return NextResponse.json({
          message: 'Two-factor authentication required',
          mfaRequired: true,
          email: user.email,
          user: null,
        }, { status: 200 });
      }

      // Normal Login -> Create Session
      const session = AuthStore.createSession(user.id, userAgent, ipAddress);
      const res = NextResponse.json({
        message: 'Logged in successfully',
        mfaRequired: false,
        user: AuthStore.sanitizeUser(user),
        sessionId: session.id,
      });

      res.cookies.set('sanjeevni_session_id', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return res;
    }

    // 7. LOGOUT
    if (action === 'logout') {
      const session = getSessionFromRequest(req);
      if (session) {
        AuthStore.deleteSession(session.id, session.userId);
      }

      const res = NextResponse.json({ message: 'Logged out successfully' });
      res.cookies.set('sanjeevni_session_id', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
      });

      return res;
    }

    return NextResponse.json({ error: `Unknown POST action: ${action}` }, { status: 404 });
  } catch (err: any) {
    console.error('[Auth API Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  try {
    const session = getSessionFromRequest(req);

    // 1. CURRENT USER & SESSION STATUS (/me)
    if (action === 'me') {
      if (!session) {
        return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
      }

      const user = AuthStore.findUserById(session.userId);
      if (!user) {
        return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
      }

      return NextResponse.json({
        authenticated: true,
        user: AuthStore.sanitizeUser(user),
        sessionId: session.id,
      });
    }

    return NextResponse.json({ error: `Unknown GET action: ${action}` }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
