import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  Search,
  ExternalLink,
} from "lucide-react";
import styles from "./HomeAeoGeoSection.module.css";

export function HomeAeoGeoSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("#services");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/services?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleNavSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const elem = document.querySelector(selectedSection);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* 1. TABLE OF CONTENTS & WEBMCP AGENT TOOLS */}
      <section className={styles.tocSection} aria-label="Page Navigation and Table of Contents">
        <div className={styles.tocHeader}>
          <h2 className={styles.tocTitle} id="heading-toc">
            <Compass size={15} aria-hidden="true" />
            <span>Table of Contents &amp; Quick Index</span>
          </h2>
          <span className={styles.timestamp}>
            Updated: <time dateTime="2026-10-31">October 31, 2026</time>
          </span>
        </div>

        <nav aria-label="Primary In-Page Navigation">
          <ul className={styles.tocLinks}>
            <li>
              <a href="#services" className={styles.tocLink}>
                01 · Services
              </a>
            </li>
            <li>
              <a href="#product-kalesh" className={styles.tocLink}>
                02 · Flagship Kalesh
              </a>
            </li>
            <li>
              <a href="#products" className={styles.tocLink}>
                03 · Case Studies
              </a>
            </li>
            <li>
              <a href="#arsenal" className={styles.tocLink}>
                04 · Engineering Arsenal
              </a>
            </li>
            <li>
              <a href="#comparison-matrix" className={styles.tocLink}>
                05 · Architecture Matrix
              </a>
            </li>
            <li>
              <a href="#protocol" className={styles.tocLink}>
                06 · Engineering Protocol
              </a>
            </li>
            <li>
              <a href="#tech-definitions" className={styles.tocLink}>
                07 · Tech Definitions
              </a>
            </li>
            <li>
              <a href="#faq-section" className={styles.tocLink}>
                08 · FAQ &amp; Insights
              </a>
            </li>
            <li>
              <Link to="/contact" className={styles.tocLink}>
                09 · Start Project <ArrowRight size={11} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>

        {/* Declarative WebMCP Interactivity Tools for AI Agents and Users */}
        <div className={styles.webmcpBar}>
          <form
            onSubmit={handleSearchSubmit}
            className={styles.webmcpForm}
            role="search"
            // @ts-expect-error declarative WebMCP attribute
            toolname="siteSearch"
            tooldescription="Search DIMISI Technologies engineering services, technical case studies, and proprietary products"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture, AI workflows, case studies…"
              className={styles.webmcpInput}
              aria-label="Search DIMISI Technologies"
              // @ts-expect-error declarative WebMCP attribute
              toolparamdescription="Query terms or technical concepts"
            />
            <button type="submit" className={styles.webmcpBtn} aria-label="Execute search">
              <Search size={12} style={{ display: "inline", marginRight: "4px" }} />
              Search
            </button>
          </form>

          <form
            onSubmit={handleNavSubmit}
            className={styles.webmcpForm}
            // @ts-expect-error declarative WebMCP attribute
            toolname="navigateToSection"
            tooldescription="Jump directly to a specific section on the DIMISI Technologies platform"
          >
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={styles.webmcpSelect}
              aria-label="Select section to navigate to"
              // @ts-expect-error declarative WebMCP attribute
              toolparamdescription="Section anchor ID"
            >
              <option value="#services">Section: Services Forward</option>
              <option value="#product-kalesh">Section: Kalesh Platform</option>
              <option value="#products">Section: Selected Case Studies</option>
              <option value="#arsenal">Section: Highlights &amp; Arsenal</option>
              <option value="#comparison-matrix">Section: Architecture Matrix</option>
              <option value="#protocol">Section: 4-Step Protocol</option>
              <option value="#tech-definitions">Section: Tech Definitions</option>
              <option value="#faq-section">Section: Frequently Asked Questions</option>
            </select>
            <button type="submit" className={styles.webmcpBtn}>
              Jump
            </button>
          </form>
        </div>
      </section>

      {/* 2. STRUCTURED COMPARISON TABLE */}
      <section id="comparison-matrix" aria-label="Engineering Architecture Comparison">
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <Layers size={13} aria-hidden="true" />
            <span>TECHNICAL BENCHMARK &amp; ARCHITECTURE</span>
          </div>
          <h2 className={styles.sectionTitle} id="heading-comparison">
            Engineering Capabilities: Conventional Agencies vs. DIMISI
          </h2>
          <p className={styles.sectionSubtitle}>
            How DIMISI Technologies redefines production standards through autonomous agent
            orchestration, cinematic WebGL spatial graphics, and resilient distributed
            microservices.
          </p>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th scope="col">Engineering Dimension</th>
                  <th scope="col">Conventional Software Agencies</th>
                  <th scope="col">DIMISI Technologies Studio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.dimensionCell}>AI &amp; Agentic Systems</td>
                  <td>Basic wrappers around third-party model APIs with high latency</td>
                  <td className={styles.dimisiCell}>
                    Custom autonomous multi-agent pipelines, localized RAG, and fine-tuned edge
                    models
                  </td>
                </tr>
                <tr>
                  <td className={styles.dimensionCell}>Web &amp; 3D Graphics</td>
                  <td>Standard 2D UI templates, heavy asset bundles, unoptimized layouts</td>
                  <td className={styles.dimisiCell}>
                    Cinematic Three.js &amp; WebGPU rendering running smoothly at 60 FPS
                  </td>
                </tr>
                <tr>
                  <td className={styles.dimensionCell}>Cloud Latency &amp; Uptime</td>
                  <td>Monolithic hosting environments with unmonitored cold starts</td>
                  <td className={styles.dimisiCell}>
                    Event-driven distributed architectures with sub-350ms response latencies
                  </td>
                </tr>
                <tr>
                  <td className={styles.dimensionCell}>Discovery &amp; Blueprint Speed</td>
                  <td>Lengthy 3–4 week theoretical discovery phases before code</td>
                  <td className={styles.dimisiCell}>
                    48-Hour Technical Architecture Blueprint with working prototype feasibility
                  </td>
                </tr>
                <tr>
                  <td className={styles.dimensionCell}>IP Ownership &amp; Privacy</td>
                  <td>Shared boilerplate and proprietary lock-in frameworks</td>
                  <td className={styles.dimisiCell}>
                    100% client code ownership, zero-knowledge hashing, and strict data privacy
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. STEP-BY-STEP HOW-TO PROTOCOL */}
      <section id="protocol" aria-label="Step-by-step Engineering Protocol">
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <CheckCircle2 size={13} aria-hidden="true" />
            <span>EXECUTION ROADMAP</span>
          </div>
          <h2 className={styles.sectionTitle} id="heading-how-to">
            How to Partner with DIMISI: Our 4-Step Engineering Protocol
          </h2>
          <p className={styles.sectionSubtitle}>
            Our transparent, battle-tested execution lifecycle guarantees rapid iteration from
            problem scoping to enterprise-grade production deployment.
          </p>
        </div>

        <ol className={styles.stepList}>
          <li className={styles.stepItem}>
            <span className={styles.stepNumber}>01</span>
            <h3 className={styles.stepHeading}>
              Step 1: Architectural Discovery &amp; Scope Scoping
            </h3>
            <p className={styles.stepDesc}>
              Submit your engineering goals or system bottlenecks through our intake portal. Our
              senior architects conduct rapid feasibility evaluations and identify core performance
              parameters within 24 hours.
            </p>
          </li>
          <li className={styles.stepItem}>
            <span className={styles.stepNumber}>02</span>
            <h3 className={styles.stepHeading}>
              Step 2: 48-Hour Blueprint &amp; Architecture Prototype
            </h3>
            <p className={styles.stepDesc}>
              We deliver a detailed technical blueprint featuring component topologies, database
              schemas, infrastructure costs, and a deterministic delivery timeline to validate the
              solution before coding begins.
            </p>
          </li>
          <li className={styles.stepItem}>
            <span className={styles.stepNumber}>03</span>
            <h3 className={styles.stepHeading}>
              Step 3: Agile Sprint Execution &amp; Autonomous Testing
            </h3>
            <p className={styles.stepDesc}>
              Our engineering team develops in disciplined two-week sprint cycles. Every commit
              triggers automated CI/CD pipelines, end-to-end integration tests, and security scans
              for complete reliability.
            </p>
          </li>
          <li className={styles.stepItem}>
            <span className={styles.stepNumber}>04</span>
            <h3 className={styles.stepHeading}>
              Step 4: Enterprise Production Handover &amp; SLA Telemetry
            </h3>
            <p className={styles.stepDesc}>
              We execute zero-downtime production deployment across multi-region cloud clusters,
              provide full intellectual property handover, comprehensive documentation, and 24/7
              telemetry monitoring.
            </p>
          </li>
        </ol>
      </section>

      {/* 4. DEFINITION LIST */}
      <section id="tech-definitions" aria-label="Technical Definitions">
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <HelpCircle size={13} aria-hidden="true" />
            <span>CORE CONCEPTS</span>
          </div>
          <h2 className={styles.sectionTitle} id="heading-definitions">
            Technical Terminology &amp; Architectural Definitions
          </h2>
          <p className={styles.sectionSubtitle}>
            Precise definitions of the foundational technologies powering DIMISI software platforms
            and client architectures.
          </p>
        </div>

        <div className={styles.defListCard}>
          <dl className={styles.defList}>
            <div>
              <dt className={styles.defTerm}>What is an Autonomous AI Agent?</dt>
              <dd className={styles.defDesc}>
                An autonomous AI agent is a self-directed software program engineered to perceive
                its environment, synthesize context, break complex objectives into sequential tasks,
                and execute actions using external tools and APIs with minimal human intervention.
              </dd>
            </div>
            <div>
              <dt className={styles.defTerm}>What is Cinematic WebGL?</dt>
              <dd className={styles.defDesc}>
                Cinematic WebGL is the discipline of rendering real-time 3D environments, particle
                physics, and custom GLSL shader materials directly inside the browser canvas at 60
                FPS, providing app-grade spatial interactivity without external plugins.
              </dd>
            </div>
            <div>
              <dt className={styles.defTerm}>What is Zero-Knowledge Architecture?</dt>
              <dd className={styles.defDesc}>
                Zero-knowledge architecture is a cryptographic design pattern ensuring systems can
                verify inputs, authenticate actions, and compute proofs without ever accessing,
                viewing, or storing the user's unencrypted underlying data or identity.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (PAA) */}
      <section id="faq-section" aria-label="Frequently Asked Questions">
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <HelpCircle size={13} aria-hidden="true" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className={styles.sectionTitle} id="heading-faq">
            Questions &amp; Insights: Partnering with DIMISI
          </h2>
          <p className={styles.sectionSubtitle}>
            Direct answers to common inquiries from technical leaders, founders, and enterprises
            exploring software partnerships with DIMISI Technologies.
          </p>
        </div>

        <div className={styles.faqGrid} id="faq-list">
          <article className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              What is DIMISI Technologies and what does the company specialize in?
            </h3>
            <p className={styles.faqAnswer}>
              DIMISI Technologies Private Limited is a registered Indian technology company
              recognized under Startup India by DPIIT (Certificate DIPP173003) and a member of the
              NVIDIA Inception Program. We specialize in autonomous multi-agent AI systems,
              cinematic WebGL experiences, and scalable enterprise cloud software architectures.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              What software engineering and AI agent services does DIMISI provide?
            </h3>
            <p className={styles.faqAnswer}>
              DIMISI Technologies provides end-to-end digital engineering services including
              autonomous multi-agent workflows, custom LLM fine-tuning, computer vision pipelines,
              interactive 3D WebGL interfaces, high-concurrency cloud backend systems, and native
              iOS and Android mobile platforms with guaranteed sub-350ms response latencies.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              What is Kalesh, and how does it fit into DIMISI&apos;s product ecosystem?
            </h3>
            <p className={styles.faqAnswer}>
              Kalesh is DIMISI Technologies&apos; flagship consumer social sphere and live polling
              platform. It utilizes zero-knowledge cryptographic hashing to enable unfiltered,
              authentic public discourse, live community polls, and real-time public sentiment
              analytics with enterprise-grade data privacy.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              How does DIMISI Technologies architect scalable and resilient cloud systems?
            </h3>
            <p className={styles.faqAnswer}>
              DIMISI architects distributed systems using modern event-driven microservices,
              containerization with Docker and Kubernetes, real-time message streaming, and
              distributed caching with Redis and PostgreSQL. The architecture is engineered for
              99.9% uptime, zero single points of failure, and high horizontal scalability.
            </p>
          </article>

          <article className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              How can enterprise businesses begin a project with DIMISI Technologies?
            </h3>
            <p className={styles.faqAnswer}>
              Enterprises and visionary startups can begin collaboration by submitting project
              requirements through the DIMISI Technologies contact portal. The engineering
              leadership reviews the problem statement and delivers a comprehensive technical
              architecture blueprint, timeline, and scope estimate within 48 hours.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
