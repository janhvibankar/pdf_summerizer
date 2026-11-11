# ============================================================
# PROFESSIONAL AI PDF SUMMARIZER
# Single File Application - app.py
# Tech Stack: Streamlit + Google Gemini + PyPDF2
# ============================================================

import streamlit as st
import PyPDF2
import pdfplumber
import google.generativeai as genai
from dotenv import load_dotenv
import os
import time
import io
import re
import random
from datetime import datetime

# ============================================================
# ENVIRONMENT & CONFIGURATION
# ============================================================

load_dotenv()

# Page configuration - MUST be first Streamlit command
st.set_page_config(
    page_title="AI PDF Summarizer",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': None,
        'Report a bug': None,
        'About': "# AI PDF Summarizer\nPowered by Google Gemini"
    }
)

# ============================================================
# CUSTOM CSS - Premium Dark Theme with Glassmorphism
# ============================================================

def inject_custom_css():
    """Inject all custom CSS for premium UI styling."""
    st.markdown("""
    <style>
    /* ---- IMPORT GOOGLE FONTS ---- */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

    /* ---- ROOT VARIABLES ---- */
    :root {
        --primary: #7C3AED;
        --primary-light: #8B5CF6;
        --secondary: #06B6D4;
        --accent: #EC4899;
        --success: #10B981;
        --warning: #F59E0B;
        --error: #EF4444;
        --bg-dark: #0A0A0F;
        --bg-card: rgba(255, 255, 255, 0.03);
        --bg-card-hover: rgba(255, 255, 255, 0.06);
        --border: rgba(255, 255, 255, 0.08);
        --border-glow: rgba(124, 58, 237, 0.4);
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --text-muted: #64748B;
        --gradient-1: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%);
        --gradient-2: linear-gradient(135deg, #EC4899 0%, #7C3AED 100%);
        --gradient-3: linear-gradient(135deg, #06B6D4 0%, #10B981 100%);
        --glow-purple: 0 0 40px rgba(124, 58, 237, 0.3);
        --glow-cyan: 0 0 40px rgba(6, 182, 212, 0.3);
    }

    /* ---- GLOBAL RESET & BASE ---- */
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif !important;
        color: var(--text-primary) !important;
    }

    .stApp {
        background: var(--bg-dark) !important;
        background-image:
            radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 60%) !important;
        min-height: 100vh;
    }

    /* ---- ANIMATED BACKGROUND GRID ---- */
    .stApp::before {
        content: '';
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-image:
            linear-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        pointer-events: none;
        z-index: 0;
    }

    /* ---- SIDEBAR STYLING ---- */
    section[data-testid="stSidebar"] {
        background: rgba(10, 10, 20, 0.95) !important;
        border-right: 1px solid var(--border) !important;
        backdrop-filter: blur(20px) !important;
    }

    section[data-testid="stSidebar"] > div {
        background: transparent !important;
        padding: 1rem !important;
    }

    /* ---- HIDE DEFAULT STREAMLIT ELEMENTS ---- */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stDeployButton {display: none;}

    /* ---- HERO SECTION ---- */
    .hero-container {
        text-align: center;
        padding: 3rem 2rem 2rem;
        position: relative;
        animation: fadeInDown 0.8s ease-out;
    }

    .hero-icon {
        font-size: 5rem;
        margin-bottom: 1rem;
        display: block;
        animation: float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 30px rgba(124, 58, 237, 0.6));
    }

    .hero-title {
        font-family: 'Space Grotesk', sans-serif !important;
        font-size: 3.5rem !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 50%, #EC4899 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
        line-height: 1.1 !important;
        margin-bottom: 1rem !important;
        letter-spacing: -1px !important;
    }

    .hero-subtitle {
        font-size: 1.15rem !important;
        color: var(--text-secondary) !important;
        font-weight: 400 !important;
        max-width: 600px;
        margin: 0 auto 2rem !important;
        line-height: 1.6 !important;
    }

    /* ---- BADGE ---- */
    .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 100px;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 4px;
    }

    .badge-purple {
        background: rgba(124, 58, 237, 0.15);
        border: 1px solid rgba(124, 58, 237, 0.3);
        color: #A78BFA;
    }

    .badge-cyan {
        background: rgba(6, 182, 212, 0.15);
        border: 1px solid rgba(6, 182, 212, 0.3);
        color: #67E8F9;
    }

    .badge-pink {
        background: rgba(236, 72, 153, 0.15);
        border: 1px solid rgba(236, 72, 153, 0.3);
        color: #F9A8D4;
    }

    .badge-green {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #6EE7B7;
    }

    /* ---- GLASS CARDS ---- */
    .glass-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 1rem 0;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        animation: fadeInUp 0.6s ease-out;
    }

    .glass-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(124, 58, 237, 0.3);
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.15);
        transform: translateY(-2px);
    }

    .glass-card-purple {
        border-color: rgba(124, 58, 237, 0.2);
        background: rgba(124, 58, 237, 0.05);
    }

    .glass-card-cyan {
        border-color: rgba(6, 182, 212, 0.2);
        background: rgba(6, 182, 212, 0.05);
    }

    .glass-card-pink {
        border-color: rgba(236, 72, 153, 0.2);
        background: rgba(236, 72, 153, 0.05);
    }

    .glass-card-green {
        border-color: rgba(16, 185, 129, 0.2);
        background: rgba(16, 185, 129, 0.05);
    }

    /* ---- CARD HEADERS ---- */
    .card-header {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .card-header-purple { color: #A78BFA; }
    .card-header-cyan { color: #67E8F9; }
    .card-header-pink { color: #F9A8D4; }
    .card-header-green { color: #6EE7B7; }

    /* ---- STAT BOXES ---- */
    .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin: 1rem 0;
    }

    .stat-box {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.3s ease;
        animation: fadeInUp 0.5s ease-out;
    }

    .stat-box:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(124, 58, 237, 0.2);
        border-color: rgba(124, 58, 237, 0.3);
    }

    .stat-value {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.8rem;
        font-weight: 700;
        background: var(--gradient-1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        display: block;
    }

    .stat-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 4px;
    }

    /* ---- UPLOAD ZONE ---- */
    .upload-zone {
        border: 2px dashed rgba(124, 58, 237, 0.4);
        border-radius: 20px;
        padding: 3rem 2rem;
        text-align: center;
        background: rgba(124, 58, 237, 0.03);
        transition: all 0.3s ease;
        animation: pulse-border 2s ease-in-out infinite;
    }

    .upload-zone:hover {
        border-color: rgba(124, 58, 237, 0.7);
        background: rgba(124, 58, 237, 0.07);
    }

    /* ---- CUSTOM BUTTONS ---- */
    .stButton > button {
        background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 0.75rem 2rem !important;
        font-family: 'Inter', sans-serif !important;
        font-weight: 600 !important;
        font-size: 1rem !important;
        letter-spacing: 0.3px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3) !important;
        width: 100% !important;
    }

    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5) !important;
        filter: brightness(1.1) !important;
    }

    .stButton > button:active {
        transform: translateY(0) !important;
    }

    .stButton > button:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
        transform: none !important;
    }

    /* ---- FILE UPLOADER ---- */
    [data-testid="stFileUploader"] {
        background: rgba(124, 58, 237, 0.03) !important;
        border: 2px dashed rgba(124, 58, 237, 0.3) !important;
        border-radius: 16px !important;
        padding: 1rem !important;
        transition: all 0.3s ease !important;
    }

    [data-testid="stFileUploader"]:hover {
        border-color: rgba(124, 58, 237, 0.6) !important;
        background: rgba(124, 58, 237, 0.06) !important;
    }

    [data-testid="stFileUploaderDropzone"] {
        background: transparent !important;
    }

    /* ---- SELECT BOXES ---- */
    .stSelectbox > div > div {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 10px !important;
        color: var(--text-primary) !important;
    }

    /* ---- PROGRESS BAR ---- */
    .stProgress > div > div > div {
        background: linear-gradient(90deg, #7C3AED, #06B6D4, #EC4899) !important;
        border-radius: 100px !important;
        animation: shimmer 2s infinite !important;
    }

    .stProgress > div > div {
        background: rgba(255, 255, 255, 0.05) !important;
        border-radius: 100px !important;
    }

    /* ---- TEXT AREA ---- */
    .stTextArea > div > div > textarea {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px !important;
        color: var(--text-primary) !important;
        font-family: 'Inter', sans-serif !important;
    }

    /* ---- EXPANDERS ---- */
    .streamlit-expanderHeader {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
        color: var(--text-primary) !important;
        font-weight: 600 !important;
    }

    .streamlit-expanderContent {
        background: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
        border-top: none !important;
        border-radius: 0 0 12px 12px !important;
    }

    /* ---- DIVIDERS ---- */
    hr {
        border: none !important;
        border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
        margin: 1.5rem 0 !important;
    }

    /* ---- METRICS ---- */
    [data-testid="metric-container"] {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
        padding: 1rem !important;
    }

    [data-testid="stMetricValue"] {
        color: #A78BFA !important;
        font-family: 'Space Grotesk', sans-serif !important;
        font-weight: 700 !important;
    }

    /* ---- ALERTS ---- */
    .stSuccess, .stError, .stWarning, .stInfo {
        border-radius: 12px !important;
        border: none !important;
    }

    /* ---- SUMMARY CONTENT ---- */
    .summary-content {
        background: rgba(255, 255, 255, 0.02);
        border-left: 3px solid #7C3AED;
        padding: 1.2rem 1.5rem;
        border-radius: 0 12px 12px 0;
        margin: 0.8rem 0;
        line-height: 1.8;
        color: var(--text-secondary);
        font-size: 0.95rem;
        animation: fadeInLeft 0.5s ease-out;
    }

    .summary-section-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.3rem;
        font-weight: 700;
        margin: 1.5rem 0 0.8rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* ---- LOADING ANIMATION ---- */
    .loading-container {
        text-align: center;
        padding: 2rem;
        animation: fadeIn 0.5s ease-out;
    }

    .loading-text {
        font-size: 1.1rem;
        color: var(--text-secondary);
        margin-top: 1rem;
        animation: pulse 1.5s ease-in-out infinite;
    }

    .ai-fact {
        font-size: 0.85rem;
        color: var(--text-muted);
        font-style: italic;
        margin-top: 0.5rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }

    /* ---- SIDEBAR ELEMENTS ---- */
    .sidebar-logo {
        text-align: center;
        padding: 1rem 0 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        margin-bottom: 1.5rem;
    }

    .sidebar-logo-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.3rem;
        font-weight: 700;
        background: linear-gradient(135deg, #7C3AED, #06B6D4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .sidebar-section-title {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-muted);
        font-weight: 600;
        margin: 1.2rem 0 0.6rem;
        padding-left: 4px;
    }

    .sidebar-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.6rem 0.8rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
        margin: 4px 0;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .sidebar-stat-label {
        font-size: 0.82rem;
        color: var(--text-muted);
    }

    .sidebar-stat-value {
        font-size: 0.85rem;
        font-weight: 600;
        color: #A78BFA;
    }

    .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        animation: blink 2s ease-in-out infinite;
    }

    .status-online { background: #10B981; }
    .status-offline { background: #EF4444; }

    /* ---- KEYWORD TAGS ---- */
    .keyword-tag {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(124, 58, 237, 0.1);
        border: 1px solid rgba(124, 58, 237, 0.25);
        border-radius: 100px;
        font-size: 0.8rem;
        color: #C4B5FD;
        margin: 3px;
        transition: all 0.2s ease;
    }

    .keyword-tag:hover {
        background: rgba(124, 58, 237, 0.2);
        border-color: rgba(124, 58, 237, 0.5);
        transform: translateY(-1px);
    }

    /* ---- FAQ ITEMS ---- */
    .faq-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 1rem 1.2rem;
        margin: 0.6rem 0;
        transition: all 0.2s ease;
    }

    .faq-item:hover {
        border-color: rgba(124, 58, 237, 0.2);
        background: rgba(124, 58, 237, 0.03);
    }

    .faq-question {
        font-weight: 600;
        color: #A78BFA;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .faq-answer {
        color: var(--text-secondary);
        font-size: 0.85rem;
        line-height: 1.6;
    }

    /* ---- DIVIDER WITH TEXT ---- */
    .divider-text {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1.5rem 0;
        color: var(--text-muted);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .divider-text::before,
    .divider-text::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(255, 255, 255, 0.06);
    }

    /* ---- ANIMATIONS ---- */
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }

    @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
    }

    @keyframes pulse-border {
        0%, 100% { border-color: rgba(124, 58, 237, 0.3); }
        50% { border-color: rgba(124, 58, 237, 0.6); }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    /* ---- DOWNLOAD BUTTONS ---- */
    .download-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid;
        margin: 4px;
        text-decoration: none;
    }

    /* ---- TABS STYLING ---- */
    .stTabs [data-baseweb="tab-list"] {
        background: rgba(255, 255, 255, 0.02) !important;
        border-radius: 12px !important;
        padding: 4px !important;
        gap: 4px !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
    }

    .stTabs [data-baseweb="tab"] {
        background: transparent !important;
        border-radius: 8px !important;
        color: var(--text-muted) !important;
        font-weight: 500 !important;
        padding: 8px 16px !important;
    }

    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #7C3AED, #06B6D4) !important;
        color: white !important;
    }

    /* ---- COLUMNS ---- */
    [data-testid="stHorizontalBlock"] {
        gap: 1rem !important;
    }

    /* ---- SCROLLBAR ---- */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(124, 58, 237, 0.4);
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(124, 58, 237, 0.7);
    }

    /* ---- SUCCESS ANIMATION ---- */
    .success-banner {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        animation: fadeInUp 0.6s ease-out;
    }

    /* ---- INFO TOOLTIP STYLE ---- */
    .info-tooltip {
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 8px;
        padding: 0.8rem 1rem;
        font-size: 0.85rem;
        color: #67E8F9;
        margin: 0.5rem 0;
    }

    /* ---- RADIO BUTTONS ---- */
    .stRadio > div {
        gap: 0.5rem !important;
    }

    .stRadio label {
        background: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 10px !important;
        padding: 0.5rem 1rem !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
    }

    .stRadio label:hover {
        border-color: rgba(124, 58, 237, 0.3) !important;
        background: rgba(124, 58, 237, 0.05) !important;
    }

    </style>
    """, unsafe_allow_html=True)


# ============================================================
# CONSTANTS & CONFIG
# ============================================================

AI_FACTS = [
    "💡 Large Language Models process millions of tokens to understand context...",
    "🧠 Google Gemini uses a transformer-based architecture with multimodal capabilities...",
    "⚡ AI can read and analyze a 100-page document in seconds...",
    "🌐 Neural networks have billions of parameters trained on vast amounts of text...",
    "🔬 Natural Language Processing helps AI understand human language nuances...",
    "🎯 Attention mechanisms allow AI to focus on the most important parts of text...",
    "📊 AI summarization reduces reading time by up to 90%...",
    "🚀 Transformer models revolutionized NLP since their introduction in 2017...",
    "💫 Gemini Pro can understand complex academic and technical content...",
    "🌟 AI-generated summaries maintain over 95% of key information...",
]

SUMMARY_LENGTHS = {
    "Short": "Provide a concise summary in 150-200 words.",
    "Medium": "Provide a comprehensive summary in 300-400 words.",
    "Detailed": "Provide a detailed, thorough summary in 500-700 words.",
}

SUMMARY_STYLES = {
    "Professional": "Use formal, business-appropriate language suitable for executives and professionals.",
    "Student": "Use clear, educational language with explanations. Perfect for studying and learning.",
    "Research": "Use academic language with emphasis on methodology, findings, and implications.",
    "Bullet Points": "Present all information as organized bullet points and lists for quick scanning.",
    "Simple Language": "Use very simple, everyday language. Explain technical terms. Make it accessible to everyone.",
}

MAX_TEXT_LENGTH = 50000  # Character limit for AI processing


# ============================================================
# API INITIALIZATION
# ============================================================

def initialize_gemini():
    """Initialize Google Gemini API and return status."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Try to get from Streamlit secrets
        try:
            api_key = st.secrets.get("GEMINI_API_KEY", None)
        except Exception:
            pass

    if api_key:
        try:
            genai.configure(api_key=api_key)
            # Test with a simple model listing
            model = genai.GenerativeModel('gemini-1.5-flash')
            return True, model, api_key
        except Exception as e:
            return False, None, str(e)
    return False, None, "API key not found"


# ============================================================
# PDF PROCESSING FUNCTIONS
# ============================================================

def extract_text_pypdf2(pdf_file):
    """Extract text from PDF using PyPDF2."""
    text = ""
    try:
        reader = PyPDF2.PdfReader(pdf_file)
        num_pages = len(reader.pages)
        for page_num, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- Page {page_num + 1} ---\n{page_text}"
            except Exception:
                continue
        return text, num_pages, None
    except Exception as e:
        return "", 0, str(e)


def extract_text_pdfplumber(pdf_file):
    """Extract text from PDF using pdfplumber (better accuracy)."""
    text = ""
    num_pages = 0
    try:
        with pdfplumber.open(pdf_file) as pdf:
            num_pages = len(pdf.pages)
            for page_num, page in enumerate(pdf.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num + 1} ---\n{page_text}"
                except Exception:
                    continue
        return text, num_pages, None
    except Exception as e:
        return "", 0, str(e)


def extract_pdf_text(uploaded_file):
    """
    Main text extraction function with fallback.
    Tries pdfplumber first, then PyPDF2.
    """
    # Save to bytes buffer
    pdf_bytes = uploaded_file.read()
    pdf_buffer = io.BytesIO(pdf_bytes)

    # Try pdfplumber first (better accuracy)
    text, num_pages, error = extract_text_pdfplumber(pdf_buffer)

    if not text.strip() or error:
        # Fallback to PyPDF2
        pdf_buffer.seek(0)
        text, num_pages, error = extract_text_pypdf2(pdf_buffer)

    # Reset file pointer
    uploaded_file.seek(0)

    return text, num_pages, error


def get_pdf_stats(text, num_pages, file_size_bytes):
    """Calculate PDF statistics."""
    words = len(text.split()) if text else 0
    chars = len(text) if text else 0
    sentences = len(re.split(r'[.!?]+', text)) if text else 0
    # Average reading speed: 200-250 words per minute
    reading_time_minutes = max(1, words // 220)
    file_size_kb = file_size_bytes / 1024
    file_size_mb = file_size_kb / 1024

    return {
        "words": words,
        "characters": chars,
        "sentences": sentences,
        "pages": num_pages,
        "reading_time_min": reading_time_minutes,
        "file_size_kb": round(file_size_kb, 1),
        "file_size_mb": round(file_size_mb, 2),
    }


def truncate_text(text, max_length=MAX_TEXT_LENGTH):
    """Truncate text to maximum length while preserving sentence boundaries."""
    if len(text) <= max_length:
        return text, False

    # Find last sentence boundary before max_length
    truncated = text[:max_length]
    last_period = truncated.rfind('.')
    if last_period > max_length * 0.8:
        truncated = truncated[:last_period + 1]

    return truncated, True


# ============================================================
# AI GENERATION FUNCTIONS
# ============================================================

def build_master_prompt(text, summary_length, summary_style, pdf_name):
    """Build a comprehensive, professional prompt for Gemini."""

    length_instruction = SUMMARY_LENGTHS.get(summary_length, SUMMARY_LENGTHS["Medium"])
    style_instruction = SUMMARY_STYLES.get(summary_style, SUMMARY_STYLES["Professional"])

    prompt = f"""You are an expert document analyst and professional summarizer with deep knowledge across all domains. Analyze the following PDF document thoroughly and provide a comprehensive analysis.

DOCUMENT: {pdf_name}

INSTRUCTIONS:
- Read and understand the ENTIRE document carefully
- Identify the main themes, arguments, and conclusions
- Ignore repetitive headers, footers, page numbers, and boilerplate text
- Focus on the substantive content and key insights
- {length_instruction}
- {style_instruction}
- If information seems incomplete or the document appears to be a portion of a larger work, mention this assumption

Please provide your analysis in the following structured format:

## 📋 EXECUTIVE SUMMARY
{length_instruction} Capture the essence of the entire document.

## 🎯 KEY POINTS
List the 5-8 most important points from the document as clear, actionable bullet points.

## 💡 IMPORTANT CONCEPTS
Identify and briefly explain 3-5 core concepts or ideas central to this document.

## 🏁 CONCLUSION
Summarize the main conclusions, recommendations, or outcomes presented in the document.

## 🔑 10 KEY TAKEAWAYS
Provide exactly 10 specific, valuable takeaways that readers should remember. Number them 1-10.

## 📚 IMPORTANT KEYWORDS
List 10-15 important keywords or phrases from the document, separated by commas.

## 📖 DIFFICULT TERMS EXPLAINED
Identify 3-5 technical or complex terms and provide simple, clear explanations.

## ❓ FREQUENTLY ASKED QUESTIONS
Generate 4-5 questions that someone reading this document might have, with concise answers.
Format: Q: [question]
A: [answer]

## ✅ ACTION ITEMS
List any action items, recommendations, or next steps mentioned or implied in the document.

## 📊 NUMBERS & STATISTICS
List any important numbers, statistics, percentages, or data points mentioned in the document.

## 👥 KEY ENTITIES
- **People:** Names of individuals mentioned (if any)
- **Organizations:** Companies, institutions, or groups mentioned (if any)
- **Locations:** Places or regions mentioned (if any)
- **Dates:** Important dates or time periods mentioned (if any)

---
DOCUMENT CONTENT:
{text}
---

Provide a thorough, accurate, and well-structured analysis. If the document is technical, explain concepts clearly. If there are contradictions or unclear sections, note them. Ensure all sections are complete and informative."""

    return prompt


def generate_ai_summary(model, text, summary_length, summary_style, pdf_name):
    """Send text to Gemini and get AI-generated summary."""
    try:
        # Truncate if necessary
        processed_text, was_truncated = truncate_text(text)

        # Build the prompt
        prompt = build_master_prompt(processed_text, summary_length, summary_style, pdf_name)

        # Configure generation settings
        generation_config = genai.types.GenerationConfig(
            temperature=0.3,      # Lower = more focused/factual
            top_p=0.9,
            top_k=40,
            max_output_tokens=4096,
        )

        # Generate response
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        summary_text = response.text

        return summary_text, was_truncated, None

    except Exception as e:
        error_msg = str(e)
        if "quota" in error_msg.lower():
            return None, False, "API quota exceeded. Please check your Gemini API plan."
        elif "invalid" in error_msg.lower() and "key" in error_msg.lower():
            return None, False, "Invalid API key. Please check your GEMINI_API_KEY."
        elif "network" in error_msg.lower() or "connection" in error_msg.lower():
            return None, False, "Network error. Please check your internet connection."
        elif "safety" in error_msg.lower():
            return None, False, "Content was filtered by safety settings. Try a different document."
        else:
            return None, False, f"AI generation error: {error_msg}"


def parse_summary_sections(summary_text):
    """Parse the AI summary into structured sections."""
    sections = {}

    # Define section markers
    section_patterns = {
        "executive_summary": r"## 📋 EXECUTIVE SUMMARY(.*?)(?=## |$)",
        "key_points": r"## 🎯 KEY POINTS(.*?)(?=## |$)",
        "important_concepts": r"## 💡 IMPORTANT CONCEPTS(.*?)(?=## |$)",
        "conclusion": r"## 🏁 CONCLUSION(.*?)(?=## |$)",
        "key_takeaways": r"## 🔑 10 KEY TAKEAWAYS(.*?)(?=## |$)",
        "keywords": r"## 📚 IMPORTANT KEYWORDS(.*?)(?=## |$)",
        "difficult_terms": r"## 📖 DIFFICULT TERMS EXPLAINED(.*?)(?=## |$)",
        "faqs": r"## ❓ FREQUENTLY ASKED QUESTIONS(.*?)(?=## |$)",
        "action_items": r"## ✅ ACTION ITEMS(.*?)(?=## |$)",
        "statistics": r"## 📊 NUMBERS & STATISTICS(.*?)(?=## |$)",
        "entities": r"## 👥 KEY ENTITIES(.*?)(?=## |$)",
    }

    for key, pattern in section_patterns.items():
        match = re.search(pattern, summary_text, re.DOTALL | re.IGNORECASE)
        if match:
            sections[key] = match.group(1).strip()
        else:
            sections[key] = ""

    return sections


# ============================================================
# UI COMPONENT FUNCTIONS
# ============================================================

def render_hero_section():
    """Render the animated hero section."""
    st.markdown("""
    <div class="hero-container">
        <span class="hero-icon">📄</span>
        <h1 class="hero-title">AI PDF Summarizer</h1>
        <p class="hero-subtitle">
            Upload your PDF and get an AI-powered, structured summary in seconds.
            Powered by Google Gemini — the world's most capable AI.
        </p>
        <div>
            <span class="badge badge-purple">🤖 Gemini AI</span>
            <span class="badge badge-cyan">⚡ Instant Analysis</span>
            <span class="badge badge-pink">🎯 Smart Extraction</span>
            <span class="badge badge-green">✅ Free to Use</span>
        </div>
    </div>
    """, unsafe_allow_html=True)


def render_sidebar(api_status, stats=None):
    """Render the sidebar with all information panels."""
    with st.sidebar:
        # Logo & Branding
        st.markdown("""
        <div class="sidebar-logo">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄</div>
            <div class="sidebar-logo-title">AI PDF Summarizer</div>
            <div style="font-size: 0.7rem; color: #64748B; margin-top: 4px;">v2.0 • Powered by Gemini</div>
        </div>
        """, unsafe_allow_html=True)

        # API Status
        st.markdown('<div class="sidebar-section-title">🔌 System Status</div>', unsafe_allow_html=True)
        if api_status:
            st.markdown("""
            <div class="sidebar-stat">
                <span class="sidebar-stat-label">
                    <span class="status-dot status-online"></span>Gemini API
                </span>
                <span class="sidebar-stat-value">● Online</span>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div class="sidebar-stat">
                <span class="sidebar-stat-label">
                    <span class="status-dot status-offline"></span>Gemini API
                </span>
                <span class="sidebar-stat-value" style="color: #EF4444;">● Offline</span>
            </div>
            """, unsafe_allow_html=True)

        st.markdown(f"""
        <div class="sidebar-stat">
            <span class="sidebar-stat-label">🕐 Session Time</span>
            <span class="sidebar-stat-value">{datetime.now().strftime('%H:%M')}</span>
        </div>
        """, unsafe_allow_html=True)

        # Document Stats (shown when PDF is uploaded)
        if stats:
            st.markdown('<div class="sidebar-section-title">📊 Document Stats</div>', unsafe_allow_html=True)

            metrics = [
                ("📄 Pages", str(stats["pages"])),
                ("📝 Words", f"{stats['words']:,}"),
                ("🔤 Characters", f"{stats['characters']:,}"),
                ("⏱️ Read Time", f"{stats['reading_time_min']} min"),
                ("💾 File Size", f"{stats['file_size_kb']} KB"),
            ]

            for label, value in metrics:
                st.markdown(f"""
                <div class="sidebar-stat">
                    <span class="sidebar-stat-label">{label}</span>
                    <span class="sidebar-stat-value">{value}</span>
                </div>
                """, unsafe_allow_html=True)

        # Features Section
        st.markdown('<div class="sidebar-section-title">✨ Features</div>', unsafe_allow_html=True)
        features = [
            "📋 Executive Summary",
            "🎯 Key Points",
            "🔑 10 Takeaways",
            "❓ Auto FAQs",
            "📚 Keywords",
            "✅ Action Items",
            "👥 Entity Extraction",
            "💾 Export Options",
        ]
        for feature in features:
            st.markdown(f"""
            <div style="padding: 4px 8px; font-size: 0.8rem; color: #94A3B8;">{feature}</div>
            """, unsafe_allow_html=True)

        # About Section
        st.markdown('<div class="sidebar-section-title">ℹ️ About</div>', unsafe_allow_html=True)
        st.markdown("""
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px; padding: 1rem; font-size: 0.8rem; color: #64748B;">
            <p style="margin: 0 0 8px; color: #94A3B8;">
                A professional AI-powered PDF analysis tool built with Streamlit and Google Gemini.
            </p>
            <p style="margin: 0; color: #7C3AED;">🛠️ Built with ❤️ using Python</p>
        </div>
        """, unsafe_allow_html=True)

        # Developer Info
        st.markdown('<div class="sidebar-section-title">👨‍💻 Developer</div>', unsafe_allow_html=True)
        st.markdown("""
        <div style="background: rgba(124,58,237,0.05); border: 1px solid rgba(124,58,237,0.15);
                    border-radius: 10px; padding: 1rem; font-size: 0.82rem;">
            <div style="font-weight: 600; color: #A78BFA; margin-bottom: 6px;">AI PDF Summarizer Team</div>
            <div style="color: #64748B;">
                <div>🔧 Stack: Python, Streamlit</div>
                <div>🤖 AI: Google Gemini 1.5</div>
                <div>📅 2024 Edition</div>
            </div>
        </div>
        """, unsafe_allow_html=True)


def render_pdf_info_card(file_name, stats):
    """Render the PDF information card."""
    st.markdown("""
    <div class="glass-card glass-card-purple">
        <div class="card-header card-header-purple">📄 Document Information</div>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown(f"""
        <div class="stat-box">
            <span class="stat-value">{stats['pages']}</span>
            <div class="stat-label">📄 Pages</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="stat-box">
            <span class="stat-value">{stats['words']:,}</span>
            <div class="stat-label">📝 Words</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="stat-box">
            <span class="stat-value">{stats['reading_time_min']}m</span>
            <div class="stat-label">⏱️ Read Time</div>
        </div>
        """, unsafe_allow_html=True)

    col4, col5, col6 = st.columns(3)

    with col4:
        st.markdown(f"""
        <div class="stat-box">
            <span class="stat-value">{stats['characters']:,}</span>
            <div class="stat-label">🔤 Characters</div>
        </div>
        """, unsafe_allow_html=True)

    with col5:
        st.markdown(f"""
        <div class="stat-box">
            <span class="stat-value">{stats['file_size_kb']}</span>
            <div class="stat-label">💾 KB Size</div>
        </div>
        """, unsafe_allow_html=True)

    with col6:
        st.markdown(f"""
        <div class="stat-box">
            <span class="stat-value">{stats['sentences']:,}</span>
            <div class="stat-label">📖 Sentences</div>
        </div>
        """, unsafe_allow_html=True)

    # File name display
    st.markdown(f"""
    <div class="info-tooltip" style="margin-top: 1rem;">
        📁 <strong>File:</strong> {file_name}
        &nbsp;&nbsp;|&nbsp;&nbsp;
        💾 <strong>Size:</strong> {stats['file_size_mb']} MB
        &nbsp;&nbsp;|&nbsp;&nbsp;
        ⏱️ <strong>Estimated Reading Time:</strong> {stats['reading_time_min']} minutes
    </div>
    """, unsafe_allow_html=True)


def render_loading_animation(progress_placeholder, text_placeholder, fact_placeholder):
    """Render animated loading state with AI facts."""
    steps = [
        (0.1, "📄 Reading PDF document..."),
        (0.25, "🔍 Extracting key information..."),
        (0.40, "🧠 Analyzing content with Gemini AI..."),
        (0.55, "💡 Identifying important concepts..."),
        (0.70, "📊 Generating structured summary..."),
        (0.82, "🎯 Extracting key takeaways..."),
        (0.92, "✨ Finalizing your analysis..."),
        (0.98, "🚀 Almost done!"),
    ]

    for progress, message in steps:
        progress_placeholder.progress(progress)
        text_placeholder.markdown(f"""
        <div class="loading-text">{message}</div>
        """, unsafe_allow_html=True)
        fact_placeholder.markdown(f"""
        <div class="ai-fact">{random.choice(AI_FACTS)}</div>
        """, unsafe_allow_html=True)
        time.sleep(0.4)


def render_summary_section(sections, stats, processing_time, was_truncated):
    """Render the complete summary with all sections."""

    # Success Banner
    compression_ratio = 0
    if stats["words"] > 0:
        summary_words = len(sections.get("executive_summary", "").split())
        compression_ratio = round((1 - summary_words / max(stats["words"], 1)) * 100, 1)

    st.markdown(f"""
    <div class="success-banner">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
        <div style="font-size: 1.2rem; font-weight: 700; color: #6EE7B7; margin-bottom: 0.5rem;">
            Analysis Complete!
        </div>
        <div style="color: #94A3B8; font-size: 0.9rem;">
            Processed in {processing_time:.2f}s
            &nbsp;•&nbsp; Compression: {compression_ratio}%
            &nbsp;•&nbsp; {stats['pages']} pages analyzed
        </div>
    </div>
    """, unsafe_allow_html=True)

    if was_truncated:
        st.warning("⚠️ **Large Document Notice:** This PDF was very large. The AI analyzed the first 50,000 characters. For best results, consider splitting large documents.")

    # Quick Stats Row
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="divider-text">📊 ANALYSIS STATISTICS</div>
    """, unsafe_allow_html=True)

    qcol1, qcol2, qcol3, qcol4 = st.columns(4)
    with qcol1:
        st.metric("📄 Pages", stats["pages"])
    with qcol2:
        st.metric("📝 Words", f"{stats['words']:,}")
    with qcol3:
        st.metric("⏱️ Process Time", f"{processing_time:.2f}s")
    with qcol4:
        st.metric("🗜️ Compression", f"{compression_ratio}%")

    st.markdown("<br>", unsafe_allow_html=True)

    # Main Tabs
    tab1, tab2, tab3, tab4 = st.tabs([
        "📋 Summary", "🔍 Deep Analysis", "👥 Entities & Data", "💾 Export"
    ])

    # ---- TAB 1: MAIN SUMMARY ----
    with tab1:

        # Executive Summary
        if sections.get("executive_summary"):
            st.markdown("""
            <div class="glass-card glass-card-purple">
                <div class="card-header card-header-purple">📋 Executive Summary</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content">{sections['executive_summary']}</div>
            """, unsafe_allow_html=True)

        # Key Points
        if sections.get("key_points"):
            st.markdown("""
            <div class="glass-card glass-card-cyan" style="margin-top: 1.5rem;">
                <div class="card-header card-header-cyan">🎯 Key Points</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content" style="border-left-color: #06B6D4;">
                {sections['key_points']}
            </div>
            """, unsafe_allow_html=True)

        # Important Concepts
        if sections.get("important_concepts"):
            st.markdown("""
            <div class="glass-card glass-card-pink" style="margin-top: 1.5rem;">
                <div class="card-header card-header-pink">💡 Important Concepts</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content" style="border-left-color: #EC4899;">
                {sections['important_concepts']}
            </div>
            """, unsafe_allow_html=True)

        # Conclusion
        if sections.get("conclusion"):
            st.markdown("""
            <div class="glass-card glass-card-green" style="margin-top: 1.5rem;">
                <div class="card-header card-header-green">🏁 Conclusion</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content" style="border-left-color: #10B981;">
                {sections['conclusion']}
            </div>
            """, unsafe_allow_html=True)

    # ---- TAB 2: DEEP ANALYSIS ----
    with tab2:

        # 10 Key Takeaways
        if sections.get("key_takeaways"):
            st.markdown("""
            <div class="glass-card glass-card-purple">
                <div class="card-header card-header-purple">🔑 10 Key Takeaways</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content">{sections['key_takeaways']}</div>
            """, unsafe_allow_html=True)

        # Difficult Terms
        if sections.get("difficult_terms"):
            st.markdown("""
            <div class="glass-card glass-card-cyan" style="margin-top: 1.5rem;">
                <div class="card-header card-header-cyan">📖 Difficult Terms Explained</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content" style="border-left-color: #06B6D4;">
                {sections['difficult_terms']}
            </div>
            """, unsafe_allow_html=True)

        # FAQs
        if sections.get("faqs"):
            st.markdown("""
            <div class="glass-card glass-card-pink" style="margin-top: 1.5rem;">
                <div class="card-header card-header-pink">❓ Frequently Asked Questions</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content" style="border-left-color: #EC4899;">
                {sections['faqs']}
            </div>
            """, unsafe_allow_html=True)

        # Action Items
        if sections.get("action_items"):
            st.markdown("""
            <div class="glass-card glass-card-green" style="margin-top: 1.5rem;">
                <div class="card-header card-header-green">✅ Action Items</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content" style="border-left-color: #10B981;">
                {sections['action_items']}
            </div>
            """, unsafe_allow_html=True)

        # Keywords
        if sections.get("keywords"):
            st.markdown("""
            <div class="glass-card" style="margin-top: 1.5rem;">
                <div class="card-header" style="color: #F59E0B;">📚 Important Keywords</div>
            </div>
            """, unsafe_allow_html=True)
            # Parse and render as tags
            keywords_raw = sections['keywords']
            keywords = [kw.strip() for kw in re.split(r'[,\n•-]', keywords_raw) if kw.strip() and len(kw.strip()) > 2]
            keywords_html = "".join([f'<span class="keyword-tag">{kw}</span>' for kw in keywords[:20]])
            st.markdown(f"""
            <div style="padding: 1rem 0;">{keywords_html}</div>
            """, unsafe_allow_html=True)

    # ---- TAB 3: ENTITIES & DATA ----
    with tab3:

        # Statistics & Numbers
        if sections.get("statistics"):
            st.markdown("""
            <div class="glass-card glass-card-purple">
                <div class="card-header card-header-purple">📊 Numbers & Statistics</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content">{sections['statistics']}</div>
            """, unsafe_allow_html=True)

        # Entities
        if sections.get("entities"):
            st.markdown("""
            <div class="glass-card glass-card-cyan" style="margin-top: 1.5rem;">
                <div class="card-header card-header-cyan">👥 Key Entities</div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"""
            <div class="summary-content" style="border-left-color: #06B6D4;">
                {sections['entities']}
            </div>
            """, unsafe_allow_html=True)

        # Raw Summary (Collapsible)
        with st.expander("🔍 View Raw AI Response", expanded=False):
            st.markdown("""
            <div style="font-size: 0.85rem; color: #64748B; margin-bottom: 1rem;">
                This is the complete, unprocessed response from Google Gemini.
            </div>
            """, unsafe_allow_html=True)
            full_text = "\n\n".join([v for v in sections.values() if v])
            st.text_area("Complete AI Analysis", full_text, height=400, label_visibility="collapsed")

    # ---- TAB 4: EXPORT ----
    with tab4:
        st.markdown("""
        <div class="glass-card">
            <div class="card-header" style="color: #A78BFA;">💾 Export Your Summary</div>
            <div style="color: #64748B; font-size: 0.85rem; margin-bottom: 1rem;">
                Download your AI-generated analysis in multiple formats.
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Build export content
        export_content = build_export_content(sections, stats, processing_time)

        col_dl1, col_dl2, col_dl3 = st.columns(3)

        with col_dl1:
            st.markdown("#### 📄 Text File")
            st.download_button(
                label="⬇️ Download .TXT",
                data=export_content["txt"],
                file_name=f"summary_{datetime.now().strftime('%Y%m%d_%H%M')}.txt",
                mime="text/plain",
                use_container_width=True,
            )

        with col_dl2:
            st.markdown("#### 📝 Markdown")
            st.download_button(
                label="⬇️ Download .MD",
                data=export_content["markdown"],
                file_name=f"summary_{datetime.now().strftime('%Y%m%d_%H%M')}.md",
                mime="text/markdown",
                use_container_width=True,
            )

        with col_dl3:
            st.markdown("#### 📋 Copy Text")
            st.text_area(
                "Copy from here:",
                export_content["txt"],
                height=150,
                key="copy_text_area"
            )

        # Preview
        st.markdown("<br>", unsafe_allow_html=True)
        with st.expander("👁️ Preview Export Content", expanded=False):
            st.markdown(export_content["markdown"])


def build_export_content(sections, stats, processing_time):
    """Build export content in multiple formats."""

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # TXT Format
    txt_lines = [
        "=" * 60,
        "AI PDF SUMMARIZER - ANALYSIS REPORT",
        f"Generated: {timestamp}",
        "Powered by Google Gemini",
        "=" * 60,
        "",
    ]

    section_map = [
        ("EXECUTIVE SUMMARY", "executive_summary"),
        ("KEY POINTS", "key_points"),
        ("IMPORTANT CONCEPTS", "important_concepts"),
        ("CONCLUSION", "conclusion"),
        ("10 KEY TAKEAWAYS", "key_takeaways"),
        ("IMPORTANT KEYWORDS", "keywords"),
        ("DIFFICULT TERMS EXPLAINED", "difficult_terms"),
        ("FREQUENTLY ASKED QUESTIONS", "faqs"),
        ("ACTION ITEMS", "action_items"),
        ("NUMBERS & STATISTICS", "statistics"),
        ("KEY ENTITIES", "entities"),
    ]

    for title, key in section_map:
        if sections.get(key):
            txt_lines.append(f"\n{title}\n{'-' * len(title)}")
            # Clean HTML-like content
            clean_text = re.sub(r'<[^>]+>', '', sections[key])
            txt_lines.append(clean_text)
            txt_lines.append("")

    txt_lines.extend([
        "=" * 60,
        f"Document Stats: {stats['pages']} pages | {stats['words']:,} words | "
        f"{stats['characters']:,} chars | {stats['reading_time_min']} min read",
        f"Processing Time: {processing_time:.2f} seconds",
        "=" * 60,
    ])

    txt_content = "\n".join(txt_lines)

    # Markdown Format
    md_lines = [
        "# 📄 AI PDF Summary Report",
        f"> Generated: {timestamp} | Powered by Google Gemini",
        "",
        "---",
        "",
    ]

    md_section_map = [
        ("📋 Executive Summary", "executive_summary"),
        ("🎯 Key Points", "key_points"),
        ("💡 Important Concepts", "important_concepts"),
        ("🏁 Conclusion", "conclusion"),
        ("🔑 10 Key Takeaways", "key_takeaways"),
        ("📚 Important Keywords", "keywords"),
        ("📖 Difficult Terms Explained", "difficult_terms"),
        ("❓ Frequently Asked Questions", "faqs"),
        ("✅ Action Items", "action_items"),
        ("📊 Numbers & Statistics", "statistics"),
        ("👥 Key Entities", "entities"),
    ]

    for title, key in md_section_map:
        if sections.get(key):
            md_lines.append(f"## {title}")
            clean_text = re.sub(r'<[^>]+>', '', sections[key])
            md_lines.append(clean_text)
            md_lines.append("")

    md_lines.extend([
        "---",
        f"**Document Stats:** {stats['pages']} pages | {stats['words']:,} words | "
        f"{stats['reading_time_min']} min read",
        f"**Processing Time:** {processing_time:.2f} seconds",
    ])

    md_content = "\n".join(md_lines)

    return {"txt": txt_content, "markdown": md_content}


# ============================================================
# ERROR HANDLING FUNCTIONS
# ============================================================

def show_error_card(title, message, suggestion=""):
    """Display a styled error card."""
    st.markdown(f"""
    <div class="glass-card" style="border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05);">
        <div class="card-header" style="color: #FCA5A5;">❌ {title}</div>
        <div style="color: #94A3B8; font-size: 0.9rem; margin-bottom: 0.8rem;">{message}</div>
        {f'<div class="info-tooltip" style="background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #FCA5A5;">💡 {suggestion}</div>' if suggestion else ''}
    </div>
    """, unsafe_allow_html=True)


def validate_pdf(uploaded_file, text, num_pages):
    """Validate extracted PDF content and return error if any."""
    if num_pages == 0:
        return "empty_pdf", "Could not determine the number of pages."

    if not text or len(text.strip()) < 50:
        if num_pages > 0:
            return "scanned_pdf", "This appears to be a scanned PDF with no extractable text."
        return "empty_pdf", "The PDF appears to be empty or corrupted."

    if len(text) < 100:
        return "minimal_text", "Very little text was extracted from this PDF."

    return None, None


# ============================================================
# SESSION STATE MANAGEMENT
# ============================================================

def init_session_state():
    """Initialize all session state variables."""
    defaults = {
        "summary_generated": False,
        "summary_sections": {},
        "processing_time": 0,
        "was_truncated": False,
        "pdf_stats": None,
        "pdf_text": "",
        "current_file_name": "",
        "api_initialized": False,
        "gemini_model": None,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


# ============================================================
# MAIN APPLICATION
# ============================================================

def main():
    """Main application entry point."""

    # Initialize session state
    init_session_state()

    # Inject CSS
    inject_custom_css()

    # Initialize Gemini API
    api_status, model, api_info = initialize_gemini()
    st.session_state.api_initialized = api_status
    st.session_state.gemini_model = model

    # Render Sidebar
    render_sidebar(api_status, st.session_state.pdf_stats)

    # ---- MAIN CONTENT ----

    # Hero Section
    render_hero_section()

    # API Warning Banner
    if not api_status:
        st.markdown("""
        <div class="glass-card" style="border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05);
                    text-align: center; padding: 1.5rem;">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚠️</div>
            <div style="font-weight: 700; color: #FCD34D; margin-bottom: 0.5rem;">Gemini API Not Configured</div>
            <div style="color: #94A3B8; font-size: 0.88rem;">
                Please add your <strong>GEMINI_API_KEY</strong> to a <code>.env</code> file
                or Streamlit secrets to enable AI features.<br>
                Get your free API key at <strong>aistudio.google.com</strong>
            </div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)

    # ---- CONFIGURATION PANEL ----
    st.markdown("""
    <div class="divider-text">⚙️ CONFIGURATION</div>
    """, unsafe_allow_html=True)

    config_col1, config_col2, config_col3 = st.columns([1, 1, 1])

    with config_col1:
        st.markdown("""
        <div style="font-size: 0.85rem; color: #94A3B8; margin-bottom: 0.5rem;">
            📏 Summary Length
        </div>
        """, unsafe_allow_html=True)
        summary_length = st.selectbox(
            "Summary Length",
            options=["Short", "Medium", "Detailed"],
            index=1,
            label_visibility="collapsed"
        )

    with config_col2:
        st.markdown("""
        <div style="font-size: 0.85rem; color: #94A3B8; margin-bottom: 0.5rem;">
            🎨 Summary Style
        </div>
        """, unsafe_allow_html=True)
        summary_style = st.selectbox(
            "Summary Style",
            options=["Professional", "Student", "Research", "Bullet Points", "Simple Language"],
            index=0,
            label_visibility="collapsed"
        )

    with config_col3:
        st.markdown("""
        <div style="font-size: 0.85rem; color: #94A3B8; margin-bottom: 0.5rem;">
            🌐 Language Output
        </div>
        """, unsafe_allow_html=True)
        language = st.selectbox(
            "Language",
            options=["English", "Spanish", "French", "German", "Hindi", "Arabic"],
            index=0,
            label_visibility="collapsed"
        )

    # Show config summary
    st.markdown(f"""
    <div style="text-align: center; margin: 0.5rem 0 1.5rem;">
        <span class="badge badge-purple">📏 {summary_length}</span>
        <span class="badge badge-cyan">🎨 {summary_style}</span>
        <span class="badge badge-green">🌐 {language}</span>
    </div>
    """, unsafe_allow_html=True)

    # ---- PDF UPLOAD SECTION ----
    st.markdown("""
    <div class="divider-text">📤 UPLOAD DOCUMENT</div>
    """, unsafe_allow_html=True)

    uploaded_file = st.file_uploader(
        "Drop your PDF here or click to browse",
        type=["pdf"],
        help="Upload a PDF file to analyze. Maximum recommended size: 50MB",
        label_visibility="visible"
    )

    # ---- PROCESS UPLOADED FILE ----
    if uploaded_file is not None:
        file_name = uploaded_file.name
        file_size = uploaded_file.size

        # Check if it's a new file
        if st.session_state.current_file_name != file_name:
            st.session_state.summary_generated = False
            st.session_state.current_file_name = file_name
            st.session_state.pdf_stats = None

        # File size warning
        if file_size > 50 * 1024 * 1024:  # 50MB
            show_error_card(
                "Large File Warning",
                f"This PDF is {file_size / (1024*1024):.1f}MB. Very large files may be slow to process.",
                "Consider splitting the PDF into smaller sections for best results."
            )

        st.markdown("<br>", unsafe_allow_html=True)

        # Extract PDF text
        with st.spinner("📖 Reading PDF..."):
            pdf_text, num_pages, extract_error = extract_pdf_text(uploaded_file)

        if extract_error and not pdf_text:
            show_error_card(
                "PDF Read Error",
                f"Could not read the PDF: {extract_error}",
                "Ensure the PDF is not password-protected or corrupted. Try re-saving the PDF."
            )
        else:
            # Validate content
            error_type, error_msg = validate_pdf(uploaded_file, pdf_text, num_pages)

            if error_type == "scanned_pdf":
                show_error_card(
                    "Scanned PDF Detected",
                    "This PDF contains scanned images rather than text. OCR processing is required.",
                    "Please use a PDF with selectable text, or convert using OCR tools like Adobe Acrobat or Tesseract."
                )
            elif error_type == "empty_pdf":
                show_error_card(
                    "Empty PDF",
                    "No content could be extracted from this PDF.",
                    "Ensure the PDF has readable text content and is not corrupted."
                )
            else:
                # Calculate stats
                stats = get_pdf_stats(pdf_text, num_pages, file_size)
                st.session_state.pdf_stats = stats
                st.session_state.pdf_text = pdf_text

                # Render PDF info
                render_pdf_info_card(file_name, stats)

                st.markdown("<br>", unsafe_allow_html=True)

                # ---- GENERATE SUMMARY BUTTON ----
                button_disabled = not api_status or st.session_state.get("processing", False)

                if not api_status:
                    st.markdown("""
                    <div class="info-tooltip">
                        🔑 Configure your Gemini API key to enable AI summary generation.
                    </div>
                    """, unsafe_allow_html=True)

                generate_clicked = st.button(
                    "🚀 Generate AI Summary" if api_status else "🔑 API Key Required",
                    disabled=button_disabled,
                    use_container_width=True,
                    key="generate_btn"
                )

                # ---- GENERATE SUMMARY ----
                if generate_clicked and api_status and not st.session_state.get("processing", False):
                    st.session_state.processing = True
                    st.session_state.summary_generated = False

                    # Loading Animation Container
                    st.markdown("""
                    <div class="divider-text" style="margin-top: 2rem;">🤖 AI PROCESSING</div>
                    """, unsafe_allow_html=True)

                    st.markdown("""
                    <div class="glass-card glass-card-purple" style="text-align: center;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🧠</div>
                        <div style="font-weight: 700; color: #A78BFA; margin-bottom: 0.5rem;">
                            Gemini AI is Analyzing Your Document
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    progress_bar = st.progress(0)
                    loading_text = st.empty()
                    fact_display = st.empty()

                    # Start timer
                    start_time = time.time()

                    # Animated progress (pre-API)
                    render_loading_animation(progress_bar, loading_text, fact_display)

                    # Generate actual summary
                    loading_text.markdown("""
                    <div class="loading-text">🚀 Sending to Gemini AI...</div>
                    """, unsafe_allow_html=True)
                    progress_bar.progress(0.95)

                    # Language instruction
                    lang_instruction = ""
                    if language != "English":
                        lang_instruction = f"\n\nIMPORTANT: Provide the ENTIRE response in {language} language."

                    # Modify text with language instruction if needed
                    modified_text = pdf_text + lang_instruction

                    # Call Gemini API
                    summary_text, was_truncated, error = generate_ai_summary(
                        st.session_state.gemini_model,
                        modified_text,
                        summary_length,
                        summary_style,
                        file_name
                    )

                    processing_time = time.time() - start_time

                    # Complete progress
                    progress_bar.progress(1.0)
                    time.sleep(0.3)

                    # Clear loading elements
                    progress_bar.empty()
                    loading_text.empty()
                    fact_display.empty()

                    st.session_state.processing = False

                    if error:
                        show_error_card(
                            "AI Generation Failed",
                            error,
                            "Check your API key and internet connection, then try again."
                        )
                    elif summary_text:
                        # Parse sections
                        sections = parse_summary_sections(summary_text)
                        st.session_state.summary_sections = sections
                        st.session_state.summary_generated = True
                        st.session_state.processing_time = processing_time
                        st.session_state.was_truncated = was_truncated
                        st.rerun()

                # ---- RENDER EXISTING SUMMARY ----
                if st.session_state.summary_generated and st.session_state.summary_sections:
                    st.markdown("""
                    <div class="divider-text" style="margin-top: 2rem;">📊 AI ANALYSIS RESULTS</div>
                    """, unsafe_allow_html=True)

                    render_summary_section(
                        st.session_state.summary_sections,
                        stats,
                        st.session_state.processing_time,
                        st.session_state.was_truncated
                    )

    else:
        # No file uploaded - show feature preview
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown("""
        <div class="divider-text">✨ WHAT YOU'LL GET</div>
        """, unsafe_allow_html=True)

        feat_col1, feat_col2, feat_col3 = st.columns(3)

        features_data = [
            (feat_col1, "glass-card-purple", "card-header-purple", [
                ("📋", "Executive Summary", "Comprehensive overview of your entire document"),
                ("🎯", "Key Points", "Most important takeaways, clearly listed"),
                ("💡", "Core Concepts", "Complex ideas explained simply"),
            ]),
            (feat_col2, "glass-card-cyan", "card-header-cyan", [
                ("🔑", "10 Takeaways", "Exactly 10 valuable insights to remember"),
                ("❓", "Auto FAQs", "Questions & answers generated automatically"),
                ("📖", "Term Glossary", "Difficult words explained in plain English"),
            ]),
            (feat_col3, "glass-card-pink", "card-header-pink", [
                ("👥", "Entity Extraction", "People, places, organizations identified"),
                ("📊", "Data Points", "Numbers and statistics highlighted"),
                ("💾", "Export Options", "Download as TXT, Markdown, or copy"),
            ]),
        ]

        for col, card_class, header_class, items in features_data:
            with col:
                items_html = "".join([
                    f"""<div style="display: flex; gap: 10px; margin: 0.8rem 0; align-items: flex-start;">
                        <span style="font-size: 1.3rem;">{icon}</span>
                        <div>
                            <div style="font-weight: 600; font-size: 0.9rem; color: #F8FAFC;">{title}</div>
                            <div style="font-size: 0.78rem; color: #64748B; margin-top: 2px;">{desc}</div>
                        </div>
                    </div>"""
                    for icon, title, desc in items
                ])
                st.markdown(f"""
                <div class="glass-card {card_class}">
                    <div class="card-header {header_class}">Features</div>
                    {items_html}
                </div>
                """, unsafe_allow_html=True)

        # How it works
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown("""
        <div class="divider-text">🔄 HOW IT WORKS</div>
        """, unsafe_allow_html=True)

        steps_col1, steps_col2, steps_col3, steps_col4 = st.columns(4)

        steps = [
            (steps_col1, "01", "📤", "Upload PDF", "Drag & drop your PDF file"),
            (steps_col2, "02", "⚙️", "Configure", "Choose style & length"),
            (steps_col3, "03", "🤖", "AI Analyzes", "Gemini reads everything"),
            (steps_col4, "04", "✨", "Get Results", "Structured insights ready"),
        ]

        for col, num, icon, title, desc in steps:
            with col:
                st.markdown(f"""
                <div class="stat-box" style="padding: 1.5rem 1rem;">
                    <div style="font-size: 0.7rem; color: #7C3AED; font-weight: 700; margin-bottom: 0.5rem;">
                        STEP {num}
                    </div>
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">{icon}</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: #F8FAFC;">{title}</div>
                    <div style="font-size: 0.75rem; color: #64748B; margin-top: 4px;">{desc}</div>
                </div>
                """, unsafe_allow_html=True)

    # ---- FOOTER ----
    st.markdown("<br><br>", unsafe_allow_html=True)
    st.markdown("""
    <div style="text-align: center; padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.06);">
        <div style="font-size: 0.85rem; color: #475569;">
            Powered by
            <span style="color: #A78BFA; font-weight: 600;">Google Gemini</span>
            &nbsp;•&nbsp;
            Built with
            <span style="color: #67E8F9; font-weight: 600;">Streamlit</span>
            &nbsp;•&nbsp;
            <span style="color: #F9A8D4; font-weight: 600;">AI PDF Summarizer v2.0</span>
        </div>
        <div style="font-size: 0.75rem; color: #334155; margin-top: 0.5rem;">
            © 2024 AI PDF Summarizer. All rights reserved.
        </div>
    </div>
    """, unsafe_allow_html=True)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()