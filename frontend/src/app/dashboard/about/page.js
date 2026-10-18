"use client";

export default function AboutPage() {
  const technologies = [
    {
      category: "Frontend",
      tools: [
        { name: "Next.js", description: "React Framework for fast, server-rendered applications and routing." },
        { name: "React", description: "UI library for building interactive, component-based user interfaces." },
        { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid UI development." },
        { name: "Vanilla Custom CSS", description: "Custom variables and design tokens used for styling and theme tokens." }
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
    <>
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Architecture</p>
          <h1 className="db-title">About Spam Shield</h1>
          <p className="db-subtitle">
            An advanced, AI-powered threat detection platform designed to secure communications.
          </p>
        </div>
      </header>

      {/* Technology Stack Section */}
      <section className="db-card" style={{ marginBottom: '32px' }}>
        <div className="db-card-header">
          <div>
            <h2 className="db-card-title">Technology stack</h2>
            <p className="db-subtitle" style={{ margin: '4px 0 0' }}>
              Spam Shield is built on a full-stack architecture pairing a Python machine learning backend with a responsive Next.js frontend.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
          {technologies.map((section, idx) => (
            <div key={idx} style={{ borderTop: idx > 0 ? '1px solid var(--line)' : 'none', paddingTop: idx > 0 ? '24px' : '0' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--acc)', margin: '0 0 16px' }}>
                {section.category}
              </h3>

              <div className="db-tech-grid">
                {section.tools.map((tool, tIdx) => (
                  <div key={tIdx} className="db-tech-item">
                    <h4 className="db-tech-name">{tool.name}</h4>
                    <p className="db-tech-desc">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="db-card">
        <div className="db-card-header">
          <div>
            <h2 className="db-card-title">How it works: detection pipeline</h2>
            <p className="db-subtitle" style={{ margin: '4px 0 0' }}>
              From raw message input to probability score and classification verdict.
            </p>
          </div>
        </div>

        <div className="db-pipeline" style={{ marginTop: '28px' }}>
          {[
            {
              tag: "Step 1",
              title: "Input Processing",
              desc: "The user submits a raw SMS or Email message. The backend receives this and immediately executes text cleaning—removing special characters, converting to lowercase, and performing tokenization."
            },
            {
              tag: "Step 2",
              title: "TF-IDF Vectorization",
              desc: "The cleaned text is passed through our pre-fitted Term Frequency-Inverse Document Frequency (TF-IDF) Vectorizer. This transforms the textual data into a mathematical matrix, scaling down common words and emphasizing unique threat indicators."
            },
            {
              tag: "Step 3",
              title: "ML Classification",
              desc: "The weighted vectors are fed into our classification algorithm which has been pre-trained on thousands of spam and legitimate messages."
            },
            {
              tag: "Step 4",
              title: "Result Generation",
              desc: "The model outputs a probability score. Based on confidence thresholds, the system flags the message as 'Safe' or 'Spam', logs the result for dashboard rendering, and alerts the user if a threat is detected."
            }
          ].map((flow, i) => (
            <div key={i} className="db-pipe-step">
              <span className="db-pipe-dot" />
              <span className="db-pipe-tag">{flow.tag}</span>
              <h4 className="db-pipe-title">{flow.title}</h4>
              <p className="db-pipe-desc">{flow.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
