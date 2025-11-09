from fpdf import FPDF
from datetime import datetime
import json

class InterviewReportPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)

    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Mock Interview Report - InturnX', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def add_section_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_fill_color(240, 240, 240)
        self.cell(0, 10, title, 0, 1, 'L', True)
        self.ln(5)

    def add_text(self, text, font_size=12, style=''):
        self.set_font('Arial', style, font_size)
        self.multi_cell(0, 6, text)
        self.ln(3)

def generate_interview_report(report_data):
    """Generate PDF report from interview data."""
    pdf = InterviewReportPDF()

    # Add metadata
    pdf.set_title('Mock Interview Report')
    pdf.set_author('InturnX AI Interviewer')

    pdf.add_page()

    # Header Information
    pdf.add_section_title('Interview Summary')
    pdf.add_text(f"Candidate: {report_data.get('candidate_name', 'Anonymous')}")
    pdf.add_text(f"Role: {report_data.get('user_role', 'Not specified')}")
    pdf.add_text(f"Date: {datetime.now().strftime('%d/%m/%Y')}")
    pdf.add_text(f"Duration: {report_data.get('duration', 'N/A')}")
    pdf.add_text(f"Questions: {report_data.get('questionCount', 0)}")
    pdf.add_text(f"Overall Score: {report_data.get('overallScore', 0)}/100")
    pdf.ln(5)

    # Visual Analytics
    if 'visualAnalytics' in report_data:
        pdf.add_section_title('Body Language & Eye Contact Analysis')
        visual = report_data['visualAnalytics']
        pdf.add_text(f"Average Eye Contact: {visual.get('avgEyeContact', 0)}%")
        pdf.add_text(f"Body Posture: {visual.get('bodyPosture', 'Not analyzed')}")
        if visual.get('facialExpressions'):
            expressions = ', '.join([f"{k}: {v}" for k, v in visual['facialExpressions'].items()])
            pdf.add_text(f"Facial Expressions: {expressions}")
        pdf.ln(5)

    # Communication Analysis
    pdf.add_section_title('Communication Analysis')
    # Mock data - in real implementation, analyze transcript
    pdf.add_text("Vocabulary: Strong")
    pdf.add_text("Clarity: High")
    pdf.add_text("Tone: Professional and steady")
    pdf.add_text("Pace: Appropriate")
    pdf.ln(5)

    # Questions and Feedback
    pdf.add_section_title('Questions and Feedback')
    for i, item in enumerate(report_data.get('transcript', []), 1):
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 8, f"Q{i}: {item['question'][:100]}{'...' if len(item['question']) > 100 else ''}", 0, 1)
        pdf.set_font('Arial', '', 10)
        pdf.multi_cell(0, 5, f"Answer: {item.get('transcript', item.get('answer', 'No answer'))[:200]}{'...' if len(item.get('transcript', item.get('answer', ''))) > 200 else ''}")
        pdf.set_font('Arial', 'I', 10)
        pdf.cell(0, 5, f"Scores - Clarity: {item['evaluation']['clarity']}%, Confidence: {item['evaluation']['confidence']}%, Technical: {item['evaluation']['technicalAccuracy']}%, Communication: {item['evaluation']['communication']}%", 0, 1)
        pdf.ln(2)

    # Recommendations
    pdf.add_section_title('Recommendations')
    for rec in report_data.get('recommendations', []):
        pdf.add_text(f"• {rec}", 11)

    return pdf.output(dest='S').encode('latin-1')