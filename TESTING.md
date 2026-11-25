# Testing Guide: AI-Powered Resume Reviewer

Three pieces must all be running: **Ollama**, the **backend**, and the **frontend**.

Most failures are one of: Ollama isn't running, the model isn't downloaded, or the
backend was started without the virtual environment.

## Setup

**1. Ollama** — open the Ollama app, then download the model once (~2 GB):

```bash
ollama pull llama3.2:3b
ollama list          # llama3.2:3b must be listed
```

**2. Backend** — the virtual environment is required, not optional:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py                 # serves on :8000
```

Your prompt should show `(venv)`. Leave this terminal running.

**3. Frontend** — in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL it prints: **`http://localhost:5173`**. Use `localhost`, not
`127.0.0.1` — Vite listens on IPv6 and the IP will not load.

**4. Verify** — third terminal, with the venv active:

```bash
python3 verify_env.py
```

Expect: `✅ Ollama is running and llama3.2:3b is available.`

## Test cases

Samples are in `samples/`; every resume is a PDF so the upload path gets tested.
Each pairs with the same-numbered job description.

| # | Why this pair |
|---|---------------|
| 1 | Backend engineer — strong match, high score |
| 2 | Career changer — missing professional experience |
| 3 | Overqualified for entry level — low score |
| 4 | New grad — projects weigh heavily |
| 5 | Data analyst vs ML engineer — wrong stack |

Regenerate with `python samples/generate_samples.py` (needs `pip install reportlab`).

**A. File upload** — set both sections to **Upload File**, pick a resume PDF and
its job description, leave the checkboxes at their defaults, click **Submit**.

**B. Typed text** — same, but use **Type text**. Worth testing separately: the
editor sends HTML, which the backend converts back to plain lines.

**C. Section checkboxes** — uncheck Skills and Education, then submit. Rewrites
should focus on Experience and Projects.

**Expect 20–90 seconds.** The app makes four model calls. "Analyzing..." is not a
freeze.

### A correct result has

- Match score, overall assessment, and work experience feedback
- Green matched-skill and red missing-skill tags
- Recommendations and suggested keywords
- Every resume line shown, colour-coded: green = good, yellow = could be stronger,
  red = unclear or missing
- A blue **Suggested rewrite** box under yellow lines

No line is ever replaced by a suggestion — the original always stays visible.

## Troubleshooting

| Problem | Fix |
|---|---|
| `No module named 'requests'` | venv not active: `source venv/bin/activate` |
| Submit fails | Run `python3 verify_env.py` |
| `model "llama3.2:3b" not found` | `ollama pull llama3.2:3b` |
| `Connection refused` on :11434 | Open the Ollama app |
| `127.0.0.1:5173` won't load | Use `http://localhost:5173` |
| Port 8000 in use | `lsof -i :8000`, kill that PID |
| Port 5173 in use | Use the port Vite prints |
| Feels frozen | First run loads the model; wait up to 2 min |

## For the report

Per sample, record: match score, skills matched and missed, how many rewrites, and
whether any rewrite invented a number or tool. The backend prints
`Dropped invented number in rewrite for line N` when the guardrail catches one, so
keep the backend terminal visible while testing.
