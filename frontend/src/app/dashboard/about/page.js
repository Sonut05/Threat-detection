"use client";

export default function AboutPage() {
  const technologies = [
    {
      category: "Frontend",
      tools: [
        { name: "Next.js", description: "React Framework for fast, server-rendered applications and routing." },
        { name: "React", description: "UI library for building interactive, component-based user interfaces." },
        { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid UI development." },
        { name: "Vanilla Custom CSS", description: "Custom variables and animations used for sophisticated Glassmorphism and Theme Switching." }
      ]
    },
    {
      category: "Backend & Services",
      tools: [
        { name: "FastAPI", description: "Modern, high-performance web framework for building Python APIs." },
        { name: "Python", description: "Core backend language, ideal for seamless integration with machine learning libraries." },
        { name: "SQLAlchemy", description: "Python SQL toolkit and Object-Relational Mapper (ORM) for robust database interactions." },
        { name: "SQLite", description: "Lightweight, disk-based database mapped securely for data storage." }
      ]
    },
    {
      category: "Artificial Intelligence & ML",
      tools: [
        { name: "Scikit-Learn", description: "Core machine learning library used for vectorization and building the threat classification model." },
        { name: "Pandas", description: "Powerful data manipulation and analysis library used internally for data handling." },
        { name: "TF-IDF Vectorization", description: "Natural Language Processing technique used to transform textual message data into mathematical vectors for the AI." },
        { name: "Predictive Classification", description: "Machine learning algorithms trained to determine the probability of a message being 'Spam' or 'Safe'." }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex flex-col mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">About SpamShield</h1>
        <p className="text-gray-400 mt-2 text-lg">
          An advanced, AI-powered threat detection platform designed to secure communications.
        </p>
      </header>

      <div className="glass-panel p-8 mb-8" style={{ borderTop: '4px solid var(--primary)' }}>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>The Technology Stack</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          SpamShield is engineered utilizing a modern, full-stack architecture that blends a high-performance Python backend with a dynamic, highly-responsive React frontend. Below is a detailed breakdown of the core technologies and methodologies powering the application.
        </p>

        <div className="space-y-10">
          {technologies.map((section, idx) => (
            <div key={idx} className="relative">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                  {idx + 1}
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {section.category}
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-11">
                {section.tools.map((tool, tIdx) => (
                  <div key={tIdx} className="p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)', boxShadow: 'var(--card-shadow)' }}>
                    <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>{tool.name}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
          How It Works: The Detection Pipeline
        </h2>
        
        <div className="relative border-l-2 ml-4 md:ml-6 mt-8" style={{ borderColor: 'var(--glass-border)' }}>
          {[
            { tag: "Step 1", title: "Input Processing", desc: "The user submits a raw SMS or Email message. The backend receives this and immediately executes text cleaning—removing special characters, converting to lowercase, and performing tokenization." },
            { tag: "Step 2", title: "TF-IDF Vectorization", desc: "The cleaned text is passed through our pre-fitted Term Frequency-Inverse Document Frequency (TF-IDF) Vectorizer. This transforms the textual data into a mathematical matrix, scaling down common words and emphasizing unique threat indicators." },
            { tag: "Step 3", title: "ML Classification", desc: "The weighted vectors are fed into our classification algorithm (e.g., Logistic Regression or Naive Bayes) which has been pre-trained on thousands of spam and legitimate messages." },
            { tag: "Step 4", title: "Result Generation", desc: "The model outputs a probability score. Based on confidence thresholds, the system flags the message as 'Safe' or 'Spam', logs the result for dashboard rendering, and alerts the user if a threat is detected." }
          ].map((flow, i) => (
            <div key={i} className="mb-10 ml-8 relative group">
              <span className="absolute -left-[45px] top-1 flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: 'var(--glass-bg)', border: '2px solid var(--primary)', color: 'var(--primary)' }}>
                {i + 1}
              </span>
              <div className="p-5 rounded-xl border transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--glass-border)' }}>
                <span className="text-xs font-bold tracking-wider uppercase mb-1 block" style={{ color: 'var(--primary)' }}>{flow.tag}</span>
                <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>{flow.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{flow.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-sm text-gray-500">
          Developed to provide a seamless, secure, and beautiful user experience.
        </p>
      </div>
    </div>
  );
}
