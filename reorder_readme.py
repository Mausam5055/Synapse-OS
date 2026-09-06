import re
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def parse_readme(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into sections by "## "
    parts = re.split(r'\n## ', content)
    
    # First part is the top section (title, intro)
    top_section = parts[0]
    
    # The rest are sections
    sections = {}
    
    for part in parts[1:]:
        lines = part.split('\n')
        title_line = lines[0]
        body = '\n'.join(lines[1:])
        
        # Determine the name of the section
        if "Hackathon Problem Statement" in title_line:
            sections["Problem Statement"] = (title_line, body)
        elif "Table of Contents" in title_line:
            sections["Table of Contents"] = (title_line, body)
        elif "Product & Interface Showcase" in title_line:
            sections["Showcase"] = (title_line, body)
        elif "Executive Summary" in title_line:
            sections["Executive Summary"] = (title_line, body)
        elif "Official Architecture Diagrams" in title_line:
            sections["Architecture Diagrams"] = (title_line, body)
        elif "System Architecture" in title_line:
            sections["System Architecture"] = (title_line, body)
        elif "Agent Swarm" in title_line:
            sections["Agent Swarm"] = (title_line, body)
        elif "Technology Stack" in title_line:
            sections["Technology Stack"] = (title_line, body)
        elif "Application Workflow" in title_line:
            sections["Application Workflow"] = (title_line, body)
        elif "Data Flow" in title_line:
            sections["Data Flow"] = (title_line, body)
        elif "Blockchain Architecture" in title_line:
            sections["Blockchain Architecture"] = (title_line, body)
        elif "Wearable Telemetry Pipeline" in title_line:
            sections["Wearable Telemetry Pipeline"] = (title_line, body)
        elif "Multilingual Architecture" in title_line:
            sections["Multilingual Architecture"] = (title_line, body)
        elif "Omnichannel 2-Way SMS Gateway" in title_line:
            sections["Omnichannel"] = (title_line, body)
        elif "Project Structure" in title_line:
            sections["Project Structure"] = (title_line, body)
        elif "API Reference" in title_line:
            sections["API Reference"] = (title_line, body)
        elif "Environment Configuration" in title_line:
            sections["Environment Configuration"] = (title_line, body)
        elif "Installation & Local Setup" in title_line:
            sections["Installation"] = (title_line, body)
        elif "Docker & Kubernetes Deployment" in title_line:
            sections["Docker"] = (title_line, body)
        elif "Security Considerations" in title_line:
            sec_parts = re.split(r'\n### 🔐 16\.1 Two-Factor Authentication \(2FA / MFA\)\n', body)
            if len(sec_parts) > 1:
                sub_parts = re.split(r'\n### ', sec_parts[1], maxsplit=1)
                tfa_body = sub_parts[0]
                rest_sec = ""
                if len(sub_parts) > 1:
                    rest_sec = "\n### " + sub_parts[1]
                sections["Security Considerations"] = (title_line, sec_parts[0] + rest_sec)
                # Only add if it's not already added from a top level
                if "Two-Factor Authentication" not in sections:
                    sections["Two-Factor Authentication"] = ("🔐 Two-Factor Authentication (2FA)", "\n" + tfa_body)
            else:
                sections["Security Considerations"] = (title_line, body)
        elif "Feature Documentation" in title_line:
            sections["Feature Documentation"] = (title_line, body)
        elif "Two-Factor Authentication" in title_line:
            sections["Two-Factor Authentication"] = (title_line, body)
        elif "Scalability & Future Improvements" in title_line:
            sections["Scalability"] = (title_line, body)
        elif "Contributing" in title_line:
            sections["Contributing"] = (title_line, body)
        elif "License" in title_line:
            sections["License"] = (title_line, body)
        else:
            print(f"Unknown section: {title_line}")

    return top_section, sections

# Reorder list
order = [
    "Executive Summary",
    "Problem Statement",
    "Table of Contents",
    "Showcase",
    "Feature Documentation",
    "Architecture Diagrams",
    "System Architecture",
    "Two-Factor Authentication",
    "Agent Swarm",
    "Blockchain Architecture",
    "Wearable Telemetry Pipeline",
    "Multilingual Architecture",
    "Omnichannel",
    "Technology Stack",
    "Application Workflow",
    "Data Flow",
    "Project Structure",
    "API Reference",
    "Environment Configuration",
    "Installation",
    "Docker",
    "Security Considerations",
    "Scalability",
    "Contributing",
    "License"
]

def format_title(index, original_title, section_key):
    # Remove old numbering
    icon_match = re.search(r'^(.*?)\s*(\d+\.)?\s*(.*)$', original_title)
    if icon_match:
        # Example: '🎯 Hackathon Problem Statement & Solution Mapping'
        # Or '📝 1. Executive Summary'
        # Group 1 might be icon, Group 2 might be numbering, Group 3 the text
        # Actually it's easier to use a regex to strip out numbers like "12. "
        clean_title = re.sub(r'\b\d+\.\s*', '', original_title)
        
        # Don't number Problem Statement, ToC, Showcase
        if section_key in ["Problem Statement", "Table of Contents", "Showcase"]:
            return clean_title
        else:
            return f"{clean_title.split(' ')[0]} {index}. {' '.join(clean_title.split(' ')[1:])}"
    return original_title

def rewrite_readme(top_section, sections, order):
    
    # Generate ToC
    toc_lines = [
        "| Icon | Section | Description | Link |",
        "| :---: | :--- | :--- | :--- |"
    ]
    
    # Icons mapping
    icons = {
        "Executive Summary": "📝",
        "Problem Statement": "🎯",
        "Showcase": "📸",
        "Feature Documentation": "📖",
        "Two-Factor Authentication": "🔐",
        "Agent Swarm": "🤖",
        "Blockchain Architecture": "🔗",
        "Wearable Telemetry Pipeline": "⌚",
        "Multilingual Architecture": "🌐",
        "Omnichannel": "📱",
        "System Architecture": "🏛️",
        "Architecture Diagrams": "🏗️",
        "Technology Stack": "💻",
        "Application Workflow": "🔄",
        "Data Flow": "🌊",
        "Project Structure": "📁",
        "API Reference": "🔌",
        "Environment Configuration": "⚙️",
        "Installation": "🚀",
        "Docker": "🐳",
        "Security Considerations": "🔒",
        "Scalability": "📈",
        "Contributing": "🤝",
        "License": "📜"
    }
    
    # Descriptions
    descs = {
        "Executive Summary": "High-level overview of the health platform",
        "Problem Statement": "Alignment with SVH26006 Problem Statement",
        "Showcase": "Visual gallery of the SynapseOS platform",
        "Feature Documentation": "List of all 21 core features and capabilities",
        "Two-Factor Authentication": "TOTP MFA, email verification, session management",
        "Agent Swarm": "Deep dive into the clinical AI swarm",
        "Blockchain Architecture": "Tamper-proof medical records on Sepolia",
        "Wearable Telemetry Pipeline": "Apple Health & Google Fit ingestion pathways",
        "Multilingual Architecture": "11 Indic language translation engine details",
        "Omnichannel": "Twilio SMS & Pinata IPFS decentralized records",
        "System Architecture": "N-tier omnichannel and microservices design",
        "Architecture Diagrams": "System flows and user journey maps",
        "Technology Stack": "Frameworks, ML models, and infrastructure used",
        "Application Workflow": "End-to-end request pipeline and intent routing",
        "Data Flow": "Shared state management and blockchain anchoring",
        "Project Structure": "Directory layout and component responsibilities",
        "API Reference": "Core endpoints for agents and omnichannel services",
        "Environment Configuration": "Required environment variables and API keys",
        "Installation": "Step-by-step guide to running the platform locally",
        "Docker": "Containerization and cluster auto-scaling",
        "Security Considerations": "Deterministic safety gates and data privacy",
        "Scalability": "Planned enhancements and production roadmap",
        "Contributing": "Guidelines for contributing to the repository",
        "License": "Open-source licensing and hackathon usage terms"
    }

    final_sections = []
    section_counter = 1
    
    for key in order:
        if key == "Table of Contents":
            continue # We will build it and place it at the end
            
        if key not in sections:
            print(f"Warning: {key} not found")
            continue
            
        orig_title, body = sections[key]
        
        # Clean title
        clean_title = re.sub(r'\b\d+\.\s*', '', orig_title)
        icon = clean_title.split(' ')[0]
        text_title = ' '.join(clean_title.split(' ')[1:])
        
        if key in ["Problem Statement", "Showcase"]:
            final_title = clean_title
            toc_title = text_title
        else:
            final_title = f"{icon} {section_counter}. {text_title}"
            toc_title = f"{section_counter}. {text_title}"
            section_counter += 1
            
        # Create anchor link
        anchor = final_title.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('.', '').replace('—', '').replace('&', '').replace(':', '').replace('/', '')
        anchor = re.sub(r'-+', '-', anchor)
        
        toc_lines.append(f"| {icons.get(key, '🔹')} | **{toc_title}** | {descs.get(key, '')} | [Go to section](#{anchor}) |")
        
        final_sections.append(f"## {final_title}\n{body}")

    # Inject ToC
    sections["Table of Contents"] = ("📑 Table of Contents", "\n" + "\n".join(toc_lines) + "\n\n---")
    
    # Reassemble
    out = [top_section]
    
    for key in order:
        if key == "Table of Contents":
            out.append(f"## {sections['Table of Contents'][0]}\n{sections['Table of Contents'][1]}")
            continue
        
        # Find the final section body we formatted
        # Actually I need to re-loop over order to insert ToC at the right place
        
    out = [top_section]
    section_counter = 1
    for key in order:
        if key == "Table of Contents":
            out.append(f"## {sections['Table of Contents'][0]}\n{sections['Table of Contents'][1]}")
            continue
        
        orig_title, body = sections[key]
        
        clean_title = re.sub(r'\b\d+\.\s*', '', orig_title)
        icon = clean_title.split(' ')[0]
        text_title = ' '.join(clean_title.split(' ')[1:])
        
        if key in ["Problem Statement", "Showcase"]:
            final_title = clean_title
        else:
            final_title = f"{icon} {section_counter}. {text_title}"
            section_counter += 1
            
        out.append(f"## {final_title}\n{body}")

    with open('README_new.md', 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))

top, secs = parse_readme('README.md')
rewrite_readme(top, secs, order)
print("Done!")
