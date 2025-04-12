# 🌟 StellarisAI: Personalized AI for Smart Hiring

**StellarisAI** revolutionizes recruitment by replacing static resumes with dynamic, AI-powered career assistants. Built on the fine-tuned LLaMA 3.2 1B model, it enables recruiters to interact with intelligent, personalized candidate representations—streamlining hiring, reducing bias, and improving decision-making with privacy-first AI.

---

## 🚀 Features

- 🤖 **LLM-Powered Candidate Assistants**: AI avatars of candidates provide real-time responses to recruiter queries.
- 📄 **Interactive Resume Replacement**: No more static CVs—get contextual answers directly from an AI.
- 🔍 **Skill-Aware Matching**: Automatically evaluates education, experience, and projects.
- 🔒 **Privacy-Centric & GDPR Compliant**: Ensures data integrity and restricts responses to verified input only.
- 📊 **Built for Real-World Deployment**: Lightweight model (1B parameters), scalable on cloud or edge devices.
- 📈 **Metrics-Driven Evaluation**: High accuracy and contextual relevance using REMR and CRS.

---

## 📦 Tech Stack

- LLaMA 3.2 1B (via [Unsloth](https://github.com/unslothai/unsloth))
- Python 3.10+
- Flask (API)
- Transformers + TRL (Fine-tuning with LoRA)
- JSON for structured data input/output
- Google Colab or local GPU (optional)

---

## 🧠 How It Works
1.Candidate Data Collection
  Input name, education, skills, projects, and certifications via a JSON form or simple UI.

2.Synthetic QA Generation
  Automatically converts candidate data into a structured dataset of 1000+ Q&A pairs.

3.Model Fine-Tuning (LoRA)
  Uses LLaMA 3.2 1B with Low-Rank Adaptation and 4-bit quantization for efficient training.

4.Chat-Based Evaluation
  Recruiters interact via /chat endpoint to evaluate skills, background, and experience dynamically.

5.Response Interpretability
  Every answer is traceable back to structured inputs—no hallucinations or speculative content.
  
---

## 🎯 Use Cases
1.Campus Placement Tools
  Let graduating students showcase their dynamic profiles via AI.

2.Smart Hiring Chatbots
  Add StellarisAI to career portals for automated screening and candidate Q&A.
  
---

## 📍 Deployment Options
 1. Local Deployment: Use Flask + ngrok for quick testing.

 2. Cloud Deployment: Host on AWS EC2, Google Cloud, or Hugging Face Spaces.

 3. Docker Integration (coming soon)

---

## 🤝 Contributors
 - Aryan S
 - Anjana B
 - Alen Sam Das
 - Daewoo Krishna S
 - Guided by Dr. Anju J Prakash (Associate Professor, CSE Dept)

## 📚 References
 - People vs Machines: HIRE Framework
 - The Role of AI in Recruitment
 - E-Recruitment with AI

## 🔧 Installation

```bash
git clone https://github.com/aaryaaanx/StellarisAI.git
cd StellarisAI
pip install -r requirements.txt





