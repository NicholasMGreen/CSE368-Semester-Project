"""Generate the sample resumes and job descriptions used for testing.

Run from the repo root:

    python samples/generate_samples.py

The resumes are written as PDFs on purpose, so the file-upload path in the app
gets exercised. All names, emails, and employers are made up.
"""

import os

from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas

HERE = os.path.dirname(os.path.abspath(__file__))
RESUME_DIR = os.path.join(HERE, "resumes")
JD_DIR = os.path.join(HERE, "job_descriptions")

PAGE_W, PAGE_H = LETTER
LEFT = 72
TOP = 720
LINE_HEIGHT = 15


def write_resume(filename, lines):
    """Render one resume to a PDF.

    Each entry is (kind, text). kind picks the font, which makes the output look
    like a normal resume instead of a wall of text.
    """
    path = os.path.join(RESUME_DIR, filename)
    pdf = canvas.Canvas(path, pagesize=LETTER)

    y = TOP
    for kind, text in lines:
        if kind == "name":
            pdf.setFont("Helvetica-Bold", 16)
            y -= 6
        elif kind == "section":
            pdf.setFont("Helvetica-Bold", 11)
            y -= 8
        else:
            pdf.setFont("Helvetica", 10)

        pdf.drawString(LEFT, y, text)
        y -= LINE_HEIGHT

    pdf.save()
    print("wrote", path)


def write_job_description(filename, text):
    path = os.path.join(JD_DIR, filename)
    with open(path, "w", encoding="utf-8") as file:
        file.write(text.strip() + "\n")
    print("wrote", path)


# ---------------------------------------------------------------------------
# Resume 1: a backend engineer who lines up almost exactly with job 1.
# ---------------------------------------------------------------------------

RESUME_1 = [
    ("name", "Jordan Alvarez"),
    ("contact", "jordan.alvarez@example.com | (716) 555-0142 | Buffalo, NY"),
    ("text", "github.com/jalvarez"),
    ("section", "SUMMARY"),
    ("text", "Backend engineer with 4 years of experience building Python services."),
    ("section", "EXPERIENCE"),
    ("text", "Software Engineer, Northwind Logistics (2022 - Present)"),
    ("bullet", "- Built 12 FastAPI endpoints serving 2 million requests per day"),
    ("bullet", "- Cut average response time from 800ms to 190ms by adding caching"),
    ("bullet", "- Designed PostgreSQL schemas for the shipment tracking product"),
    ("bullet", "- Containerized services with Docker and deployed to AWS ECS"),
    ("bullet", "- Set up GitHub Actions pipelines that run tests on every pull request"),
    ("text", "Junior Developer, Bluefin Software (2020 - 2022)"),
    ("bullet", "- Maintained a Django application used by 300 small businesses"),
    ("bullet", "- Wrote unit tests that raised coverage from 40% to 85%"),
    ("section", "PROJECTS"),
    ("text", "TrailFinder - Flask API with a React map frontend"),
    ("bullet", "- Ingests OpenStreetMap data and caches results in Redis"),
    ("section", "SKILLS"),
    ("text", "Python, FastAPI, Django, Flask, SQL, PostgreSQL, Docker, AWS, Git"),
    ("section", "EDUCATION"),
    ("text", "B.S. Computer Science, University at Buffalo, 2020"),
]

# ---------------------------------------------------------------------------
# Resume 2: a career changer. Most job-2 keywords are simply absent, which is
# what makes it useful for testing missing-skill detection.
# ---------------------------------------------------------------------------

RESUME_2 = [
    ("name", "Dana Whitfield"),
    ("contact", "dana.whitfield@example.com | (716) 555-0198 | Buffalo, NY"),
    ("section", "SUMMARY"),
    ("text", "High school math teacher moving into software development."),
    ("text", "Completed a part-time web development certificate in 2024."),
    ("section", "EXPERIENCE"),
    ("text", "Mathematics Teacher, Kenmore West High School (2017 - Present)"),
    ("bullet", "- Taught algebra and statistics to classes of 28 students"),
    ("bullet", "- Built a spreadsheet grade tracker used by the whole department"),
    ("bullet", "- Ran an after-school coding club using Scratch and Python"),
    ("text", "Tutoring Coordinator, Buffalo Learning Center (2015 - 2017)"),
    ("bullet", "- Scheduled 40 tutors across three locations each week"),
    ("section", "PROJECTS"),
    ("text", "Recipe Box - React app for saving family recipes"),
    ("bullet", "- Uses React hooks and localStorage, deployed on Netlify"),
    ("text", "Gradebook CLI - Python tool for calculating weighted averages"),
    ("section", "SKILLS"),
    ("text", "JavaScript, React, HTML, CSS, Python, Git"),
    ("section", "EDUCATION"),
    ("text", "Web Development Certificate, Buffalo State, 2024"),
    ("text", "B.A. Mathematics, SUNY Geneseo, 2015"),
]

# ---------------------------------------------------------------------------
# Resume 3: clearly overqualified for job 3. Useful for showing that a high
# score does not mean "should be hired".
# ---------------------------------------------------------------------------

RESUME_3 = [
    ("name", "Marcus Chen"),
    ("contact", "marcus.chen@example.com | (716) 555-0177 | Buffalo, NY"),
    ("section", "SUMMARY"),
    ("text", "Staff engineer with 14 years of experience leading platform teams."),
    ("section", "EXPERIENCE"),
    ("text", "Staff Software Engineer, Teradyne Systems (2018 - Present)"),
    ("bullet", "- Led a team of 9 engineers rebuilding the billing platform"),
    ("bullet", "- Migrated 140 services from EC2 to Kubernetes over 18 months"),
    ("bullet", "- Wrote the internal design review process now used company wide"),
    ("bullet", "- Mentored 6 junior engineers, 4 of whom were promoted"),
    ("text", "Senior Software Engineer, Teradyne Systems (2013 - 2018)"),
    ("bullet", "- Owned the Python service layer handling payments"),
    ("bullet", "- Reduced cloud spend by 31% through rightsizing and autoscaling"),
    ("text", "Software Engineer, Lattice Networks (2010 - 2013)"),
    ("bullet", "- Built REST APIs in Python and Java for network monitoring"),
    ("section", "SKILLS"),
    ("text", "Python, Go, Java, Kubernetes, AWS, Terraform, PostgreSQL, Kafka"),
    ("section", "EDUCATION"),
    ("text", "M.S. Computer Science, Rensselaer Polytechnic Institute, 2010"),
    ("text", "B.S. Computer Engineering, Rensselaer Polytechnic Institute, 2008"),
]

# ---------------------------------------------------------------------------
# Resume 4: a student with class projects and no professional experience.
# ---------------------------------------------------------------------------

RESUME_4 = [
    ("name", "Priya Raman"),
    ("contact", "priya.raman@example.com | (716) 555-0121 | Buffalo, NY"),
    ("section", "EDUCATION"),
    ("text", "B.S. Computer Science, University at Buffalo, expected May 2026"),
    ("text", "GPA 3.7 / 4.0, Dean's List 2024 and 2025"),
    ("section", "PROJECTS"),
    ("text", "Campus Course Planner (2025)"),
    ("bullet", "- React frontend with a Python Flask API and SQLite database"),
    ("bullet", "- Lets 200 students build schedules that avoid time conflicts"),
    ("text", "Chess Engine (2024)"),
    ("bullet", "- Wrote a minimax search with alpha-beta pruning in C++"),
    ("bullet", "- Reached 1800 Elo against a public test suite"),
    ("text", "Weather Dashboard (2024)"),
    ("bullet", "- Python script that emails a daily forecast summary"),
    ("section", "EXPERIENCE"),
    ("text", "Teaching Assistant, UB Computer Science Department (2025 - Present)"),
    ("bullet", "- Hold office hours for an intro programming course of 120 students"),
    ("bullet", "- Grade weekly assignments and give written feedback"),
    ("section", "SKILLS"),
    ("text", "Python, C++, JavaScript, React, SQL, Git, Linux"),
]

# ---------------------------------------------------------------------------
# Resume 5: strong analyst, but the ML job asks for things she has never used.
# ---------------------------------------------------------------------------

RESUME_5 = [
    ("name", "Sofia Okonkwo"),
    ("contact", "sofia.okonkwo@example.com | (716) 555-0163 | Buffalo, NY"),
    ("section", "SUMMARY"),
    ("text", "Data analyst with 5 years of experience in reporting and dashboards."),
    ("section", "EXPERIENCE"),
    ("text", "Senior Data Analyst, Kaleida Health (2021 - Present)"),
    ("bullet", "- Built 30 Tableau dashboards used by hospital operations teams"),
    ("bullet", "- Wrote SQL pipelines that refresh patient volume reports nightly"),
    ("bullet", "- Automated a manual reporting process, saving 20 hours per month"),
    ("bullet", "- Presented findings to department heads each quarter"),
    ("text", "Data Analyst, M&T Bank (2019 - 2021)"),
    ("bullet", "- Analyzed loan application data in SQL and Excel"),
    ("bullet", "- Built a Python script that flags duplicate customer records"),
    ("section", "PROJECTS"),
    ("text", "Housing Price Explorer"),
    ("bullet", "- Python notebook exploring public housing data with pandas"),
    ("section", "SKILLS"),
    ("text", "SQL, Python, pandas, Tableau, Excel, Git"),
    ("section", "EDUCATION"),
    ("text", "B.S. Statistics, University at Buffalo, 2019"),
]


# ---------------------------------------------------------------------------
# Job descriptions, written to pair one-for-one with the resumes above.
# ---------------------------------------------------------------------------

JD_1 = """
Backend Software Engineer

We are hiring a backend engineer to work on our shipment tracking platform.

Responsibilities:
- Build and maintain REST APIs in Python
- Design and optimize SQL database schemas
- Containerize services and deploy them to AWS
- Write automated tests and review pull requests

Requirements:
- 3+ years of professional Python experience
- Strong SQL and relational database knowledge
- Experience with Docker and cloud deployment
- Familiarity with Git based workflows

Preferred:
- FastAPI or Django experience
- Experience with caching and performance tuning
"""

JD_2 = """
Junior Frontend Developer

We are looking for a junior developer to help build our customer-facing web app.

Responsibilities:
- Build user interfaces in React
- Convert designs into responsive HTML and CSS
- Fix bugs reported by the support team
- Participate in code reviews

Requirements:
- Working knowledge of JavaScript and React
- Solid understanding of HTML and CSS
- Familiarity with Git
- Willingness to learn and ask questions

Preferred:
- TypeScript experience
- Experience with a testing library such as Jest
- A portfolio of personal projects
"""

JD_3 = """
Entry Level Software Engineer

Join our engineering team as an entry level software engineer.

Responsibilities:
- Develop applications using Python
- Build and maintain REST APIs
- Work with SQL databases
- Collaborate with other developers
- Write unit tests and debug applications

Requirements:
- Bachelor's degree in Computer Science or a related field
- Knowledge of Python and SQL
- Understanding of data structures and algorithms
- Familiarity with Git

Preferred:
- Experience with Flask or Django
- Knowledge of Docker and AWS
"""

JD_4 = """
Software Engineering Intern (Summer 2026)

Our internship program gives students real project work with a mentor.

Responsibilities:
- Contribute to a production Python service
- Write tests for new features
- Attend design discussions with the team
- Present your work at the end of the summer

Requirements:
- Currently enrolled in a Computer Science program
- Coursework or projects using Python
- Basic understanding of Git
- Strong communication skills

Preferred:
- Personal projects outside of class
- Familiarity with SQL
- Experience with React or another frontend framework
"""

JD_5 = """
Machine Learning Engineer

We are building recommendation models for our retail platform.

Responsibilities:
- Train and evaluate machine learning models
- Build feature pipelines from raw event data
- Deploy models to production and monitor them
- Work with product teams to define success metrics

Requirements:
- Strong Python programming skills
- Experience with PyTorch or TensorFlow
- Understanding of model evaluation and cross validation
- Experience with large datasets and SQL

Preferred:
- Experience with MLflow or similar experiment tracking
- Knowledge of Spark or another distributed system
- Familiarity with Docker and Kubernetes
"""


def main():
    os.makedirs(RESUME_DIR, exist_ok=True)
    os.makedirs(JD_DIR, exist_ok=True)

    resumes = [
        ("1_backend_engineer.pdf", RESUME_1),
        ("2_career_changer.pdf", RESUME_2),
        ("3_overqualified.pdf", RESUME_3),
        ("4_new_grad.pdf", RESUME_4),
        ("5_data_analyst.pdf", RESUME_5),
    ]
    for filename, lines in resumes:
        write_resume(filename, lines)

    job_descriptions = [
        ("1_backend_engineer.txt", JD_1),
        ("2_junior_frontend.txt", JD_2),
        ("3_entry_level_software.txt", JD_3),
        ("4_swe_intern.txt", JD_4),
        ("5_ml_engineer.txt", JD_5),
    ]
    for filename, text in job_descriptions:
        write_job_description(filename, text)


if __name__ == "__main__":
    main()
