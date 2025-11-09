# Project Proposal: Integrated AI-Powered Platform Suite for E-Commerce, Health, and Wellness

## 1. Introduction

This project develops three AI-powered platforms addressing real-world challenges in e-commerce, healthcare, and wellness: WrenCos (beauty e-commerce with live streaming), Skin Study (dermatology consultation), and Track Nutrition (intelligent nutrition tracking). 

Modern AI technologies enable sophisticated solutions that understand and respond to individual user needs in real-time. Davenport and Ronanki (2018) note that AI applications have evolved from simple automation to cognitive technologies capable of autonomous understanding and action. This project integrates natural language processing, computer vision, recommendation systems, and real-time data processing to deliver comprehensive, personalized solutions.

The motivation stems from the gap between traditional digital platforms and modern AI potential. Zhang et al. (2020) demonstrate that AI-powered personalization increases e-commerce engagement by forty-three percent and conversion rates by sixty-seven percent. Esteva et al. (2019) show AI dermatology systems achieve accuracy comparable to board-certified dermatologists, indicating significant opportunities for accessible healthcare.

Current solutions suffer from fragmentation, lack intelligent recommendations, and underutilize AI technologies. This project employs Retrieval-Augmented Generation (RAG), computer vision, natural language processing, and machine learning to create integrated systems addressing these limitations.

The work's originality lies in comprehensive AI integration across system layers—from data processing to user interaction. Key contributions include practical RAG implementations with vector databases, multi-modal input processing supporting text and image-based queries, WebRTC-WebSocket integration for real-time communication, and cross-platform development ensuring consistent web and mobile experiences.

## 2. Problem Statement

Digital transformation has revealed significant limitations across three critical domains.

In e-commerce, traditional platforms fail to replicate personalized, interactive retail experiences. Grewal et al. (2017) show that despite exponential online shopping growth, engagement and conversion rates lag behind physical retail due to limited real-time interaction and personalized demonstrations. Beauty and skincare industries particularly suffer, requiring understanding of skin types, ingredients, and individual concerns—capabilities absent in static product listings with basic filtering.

McKinsey research (Chui et al., 2018) shows AI-powered personalization increases e-commerce revenue by ten to fifteen percent while reducing acquisition costs by fifty percent. The COVID-19 pandemic accelerated online shopping, making engaging digital commerce essential for business sustainability.

Dermatological healthcare faces accessibility barriers. Narla et al. (2018) demonstrate average wait times exceed thirty days, with millions lacking geographic or economic access. According to the American Academy of Dermatology, skin diseases affect one-third of the global population (Hay et al., 2014). An accessible AI-powered platform could provide immediate, evidence-based advice while identifying conditions requiring professional intervention.

Nutrition tracking suffers from high abandonment rates. Ferrara et al. (2019) reports seventy percent abandonment within one month due to manual entry burden. Applications lack comprehensive databases and intelligent recommendations based on health goals and restrictions.

WHO (2020) reports worldwide obesity has tripled since 1975, with dietary factors contributing to cardiovascular diseases, diabetes, and cancers. An intelligent tracking system reducing user burden while providing accurate guidance could significantly impact public health.

The solution assumes users have smartphones with internet connectivity, cameras, and basic digital literacy—reasonable given eighty percent smartphone penetration in developed markets (GSMA, 2020). Data requirements are met through USDA FoodData Central, professional dermatology textbooks, and structured product information. The system provides complementary guidance with appropriate disclaimers, not medical diagnosis replacement.

## 3. Project Aim and Objectives

This project aims to develop three intelligent platforms leveraging AI technologies for e-commerce, dermatological consultation, and nutrition management, demonstrating practical applications of RAG, computer vision, natural language processing, and real-time communication.

**Objective 1:** Conduct comprehensive critical review of existing solutions and emerging technologies in AI-powered e-commerce, telemedicine, and nutrition tracking, producing detailed literature synthesis identifying innovation opportunities.

**Objective 2:** Design and implement beauty e-commerce platform with AI-powered recommendations, intelligent chatbots, and WebRTC live streaming. Integrate Google Gemini AI, MongoDB, and WebSocket communication supporting web and mobile interfaces. Success measured through complete feature implementation including product management, order processing, live streaming with product pinning, AI chat assistance, and email marketing automation.

**Objective 3:** Develop AI-powered dermatology platform using RAG with Qdrant vector database containing embeddings from ten professional textbooks. Support multi-modal input including text queries, visual skin analysis through image uploads processed by Gemini Vision API, voice-to-text transcription using Gemini multimodal capabilities, and optimized text-to-speech responses with sentence-by-sentence streaming achieving eighty-three percent faster playback. Implement intelligent memory management for uploaded images with automatic cleanup mechanisms and temporary backend storage ensuring privacy through immediate deletion after analysis. Achieve vector similarity scores exceeding seventy percent for relevant knowledge retrieval while maintaining comprehensive error handling with automatic retry logic for rate-limited API calls.

**Objective 4:** Create intelligent nutrition tracking system with computer vision food recognition (Gemini Vision API), natural language processing for text entry, local USDA database integration, and personalized recommendations using Mifflin-St Jeor equation. Achieve food recognition precision exceeding eighty percent.

**Objective 5:** Evaluate platforms through functional, performance, usability, and accuracy testing. Metrics include response times below two seconds, user satisfaction exceeding seventy percent, and AI accuracy meeting industry benchmarks.

**Objective 6:** Document development process, implementation decisions, challenges, and solutions, creating technical documentation enabling independent deployment and extension.

## 4. Background and Literature Review

### Artificial Intelligence in E-Commerce

AI in e-commerce has evolved from rule-based systems to deep learning approaches. Zhang et al. (2020) identify key techniques including collaborative filtering, natural language processing for customer service, and computer vision for visual search, demonstrating significant improvements in engagement and conversion rates when multiple techniques combine.

Live streaming commerce is emerging, particularly in Asian markets. Wongkitrungrueng and Assarut (2020) find that real-time interaction and product demonstration enhance purchase intentions. However, platforms rarely integrate advanced AI with live streaming. This project addresses this gap by combining WebRTC with AI-powered recommendations and automated customer service.

### AI in Healthcare and Telemedicine

Esteva et al. (2017) demonstrate deep learning can classify skin lesions with dermatologist-level accuracy, but focus on diagnostic tasks rather than general consultation requiring different approaches.

Lewis et al. (2020) introduce RAG, combining neural language models with information retrieval to generate responses grounded in retrieved documents. This addresses the "hallucination" problem where models generate plausible but incorrect information. This project extends RAG to dermatological knowledge bases from professional textbooks.

### Nutrition Technology and AI

Cordeiro et al. (2015) identify barriers to food logging including time requirements and portion estimation difficulty. Min et al. (2019) review deep learning for food recognition, showing accuracy improvements while highlighting challenges in portion estimation and similar food discrimination.

Eldridge et al. (2019) find natural language approaches reduce entry time while maintaining reasonable accuracy. However, systems lack comprehensive database integration and intelligent analysis. This project combines multiple AI techniques with USDA FoodData Central for comprehensive nutrition tracking.

### Vector Databases and Cross-Platform Development

Johnson et al. (2019) introduce Faiss for efficient similarity search. Qdrant builds upon this with additional features including filtering and distributed deployment. Applying vector databases to medical knowledge bases represents novel practical implementation.

Biørn-Hansen et al. (2017) compare cross-platform development approaches. React Native and Vue.js balance development efficiency with performance. However, limited guidance exists for maintaining consistent AI-powered features across platforms, a gap this project addresses through practical implementation.

### Critical Analysis

Research demonstrates AI potential in e-commerce, healthcare, and nutrition, but gaps remain in practical implementations integrating multiple AI capabilities cohesively. Most work focuses on isolated techniques rather than comprehensive platforms. This project demonstrates practical contemporary AI implementations, addresses integration challenges, and creates user-centered applications balancing sophisticated capabilities with usability.

## 5. Proposed Project Development and Methodology

### Development Methodology

The project adopts iterative agile methodology with two-week sprints. Kumar and Bhatia (2014) demonstrate agile effectively supports complex projects through iterative cycles, continuous testing, and adaptive planning. This suits AI systems where requirements evolve as capabilities and limitations emerge. Amershi et al. (2019) identify machine learning challenges including data dependencies and integration complexity, addressed through progressive refinement and continuous validation.

### Architecture and Design

The architecture follows microservices principles—each platform operates independently with its own backend, database, and frontend, sharing common infrastructure including AI services and vector databases. Richardson (2018) cites benefits including independent deployment and system resilience.

For AI components, a layered architecture separates data processing, model inference, and result presentation. The RAG system implements document retrieval through vector similarity search, context assembly, and response generation, with visual analysis capabilities through Gemini Vision API processing uploaded skin images. Image handling employs temporary blob URLs for immediate preview without disk storage, automatic memory cleanup through URL revocation, and ephemeral backend storage with immediate deletion post-analysis ensuring privacy. Gao et al. (2023) recommend modular designs facilitating component substitution and optimization.

### Tools and Technologies

**Backend:** Node.js with Express.js for concurrent request handling and WebSocket integration. MongoDB for flexible schema design and scalability.

**AI:** Google Gemini AI for text generation with multimodal capabilities supporting both audio transcription and visual skin image analysis through Gemini Vision API. Qdrant vector database for similarity search with filtering and distributed deployment enabling efficient semantic retrieval across dermatology knowledge bases. Google Text-to-Speech for voice synthesis with optimized sentence-by-sentence streaming reducing initial playback delay from three to five seconds to approximately five hundred milliseconds, incorporating automatic markdown and citation filtering for natural speech output.

**Frontend:** Vue.js for web applications with excellent developer experience. React Native with Expo for cross-platform mobile development with native capabilities including cameras and microphones.

### Data Management

MongoDB stores operational data with appropriate indexing. The dermatology knowledge base involves extracting text from ten professional textbooks, chunking into meaningful segments, generating embeddings using Google's models, and storing in Qdrant.

The USDA nutrition database implements local SQLite from FoodData Central containing four hundred thousand foods. Local implementation provides ten to one hundred times faster query response than API access (USDA, 2021). Optimization includes FTS5 full-text search indexing and composite indexes for common queries.

### Development Plan

**Phase 1 (Months 1-2):** Infrastructure setup and core backend—database systems, API frameworks, authentication, and AI integration including chatbot, RAG pipeline, and food recognition.

**Phase 2 (Month 3):** Advanced features—WebRTC live streaming, voice interaction with Gemini multimodal transcription and optimized sentence-by-sentence text-to-speech streaming, Gemini Vision API integration for skin image analysis with intelligent memory management and automatic cleanup, conversation history with semantic search, recipe scraping, and personalized nutrition calculations.

**Phase 3 (Month 4):** Frontend development—Vue.js web applications with image upload interface supporting drag-and-drop functionality and instant preview, React Native mobile applications with feature parity including camera integration for skin image capture, and implementation of consistent cross-platform image handling mechanisms.

**Phase 4 (Months 5-6):** Testing, optimization, and documentation—functional and performance testing, usability evaluation, and comprehensive technical documentation.

## 6. Project Scope and Feasibility

### Scope Definition

**In-scope:** The project encompasses fully functional web and mobile applications for all three platforms: WrenCos, Skin Study, and Track Nutrition. WrenCos includes complete e-commerce functionality with AI chatbot, WebRTC live streaming, and email marketing capabilities. Skin Study provides RAG-based consultation with voice interaction supporting speech-to-text and text-to-speech, conversation history with semantic search, and image uploads for skin condition analysis. Track Nutrition implements text and image-based food entry, USDA database integration, AI meal analysis, personalized nutrition calculations, and recipe discovery features. The backend infrastructure comprises RESTful APIs, WebSocket connections, and external AI integration through Google Gemini API. Database systems include MongoDB for operational data, Qdrant vector database for semantic search, and SQLite with appropriate schemas and optimization. Web applications support modern browsers including Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Mobile applications target iOS 13.0+ and Android 5.0+ (API Level 21), developed using Vue.js for web interfaces and React Native with Expo for cross-platform mobile deployment.

**Out-of-scope:** The project explicitly excludes production deployment with commercial hosting infrastructure, scaling systems, and app store submission processes. Real payment gateway integration such as Stripe or PayPal, along with PCI DSS compliance requirements, remains outside project boundaries. Advanced security features beyond standard authentication, including penetration testing and third-party security audits, are not included. Multi-language support and internationalization capabilities beyond English are excluded from development. Production-level operational features including continuous monitoring, auto-scaling infrastructure, and disaster recovery systems are not implemented. Advanced technological features such as blockchain integration, cryptocurrency payments, custom AI model training, and augmented or virtual reality experiences are explicitly out of scope.

### Feasibility Analysis

**Time Feasibility:** Six-month timeline divided into planning, development, testing, and documentation phases. Similar projects suggest scope achievable for dedicated developer with appropriate skills. Modular architecture enables parallel component development. Schedule allocates two months each for backend/AI integration and frontend/mobile development, one month for testing, one month for documentation—realistic per McConnell (2019) including buffer for unexpected issues.

**Technical Feasibility:** Project builds upon established technologies with extensive documentation and active communities. Developer possesses relevant web development and database experience; AI system development represents learning opportunity requiring dedicated study. Free tier access to Google Gemini API (including transcription) and text-to-speech services adequate for development. USDA database freely available. Dermatology textbooks accessible through institutional library.

**Resource Feasibility:** Requires modest computational resources—development workstation, storage for databases and media, and internet connectivity. Cloud services obtainable through free tier or minimal-cost educational credits. USDA database provides four hundred thousand foods freely available. Professional dermatology textbooks accessible through university libraries. Product data generated for demonstration or obtained from open databases.

## 7. Project Evaluation and Success Criteria

### Functional Evaluation

Test suites validate core operations including authentication, data operations, real-time communication, AI interaction, and cross-platform consistency. Success criteria specify all core features must operate correctly without critical defects. Authentication must validate credentials and maintain secure sessions. E-commerce must accurately process orders and maintain data consistency. Dermatology platform must retrieve relevant knowledge and generate appropriate responses. Nutrition platform must correctly parse descriptions, retrieve nutritional information, and calculate personalized recommendations.

### Performance Evaluation

Key metrics include API response times, database query latency, AI processing duration, and frontend rendering performance. Based on Nielsen (2019) demonstrating responses below one second feel instantaneous while delays exceeding three seconds significantly impact satisfaction, success criteria specify: API endpoints respond within two seconds for typical requests, database queries complete within five hundred milliseconds, AI response generation including RAG retrieval completes within five seconds, and image analysis completes within ten seconds.

### AI Accuracy Evaluation

For RAG dermatology system, evaluation examines retrieval relevance and generation quality using test queries with ground truth documents. Success criteria: top three retrieved documents demonstrate cosine similarity exceeding seventy percent, at least one highly relevant document appears in top three for ninety percent of queries, responses achieve factual consistency with sources exceeding ninety percent, and appropriately indicate limitations and recommend professional consultation for serious conditions.

For food recognition, evaluation employs test dataset with ground truth labels measuring top-one accuracy, top-five accuracy, and confidence calibration. Success criteria: top-five accuracy exceeds eighty percent on diverse meal images with appropriate confidence levels.

### Usability Evaluation

Heuristic evaluation employs Nielsen and Molich (1990) principles including consistency, error prevention, and aesthetic design. User testing with representative participants evaluates task completion success, time on task, error rates, and satisfaction. Success criteria: task completion rates exceed ninety percent for core tasks, user satisfaction scores exceed seventy percent on System Usability Scale, interfaces demonstrate platform consistency and provide clear feedback supporting error recovery.

## 8. Project Plan and Timeline

**Month 1—Planning and Infrastructure:** Finalize requirements, design architecture and schemas, set up development environments, implement authentication systems, and establish basic API frameworks. Milestone: operational API endpoints, implemented database schemas, initiated documentation.

**Month 2—Backend Development and AI Integration:** Develop CRUD operations, integrate Google Gemini API, implement RAG pipeline with Qdrant, construct dermatology knowledge base, develop USDA database integration, and implement food recognition. Milestone: functional backend APIs with documented endpoints, operational AI integration, functional RAG system.

**Month 3—Advanced Features:** Implement WebRTC live streaming with WebSocket signaling, develop voice interaction (speech-to-text and text-to-speech), implement conversation history with semantic search, develop recipe scraping and YouTube integration, and implement personalized nutrition calculations. Milestone: operational live streaming, functional voice interaction, completed meal discovery system.

**Month 4—Frontend and Mobile Development:** Implement Vue.js web applications, develop React Native mobile applications with Expo, ensure feature parity, implement responsive designs, develop reusable components, and implement state management. Milestone: functional web applications with complete features, operational mobile applications with feature parity, consistent cross-platform experiences.

**Month 5—Testing and Optimization:** Conduct functional testing, perform performance testing and optimization, conduct usability testing, implement bug fixes, optimize database queries and API response times, and improve AI accuracy through prompt engineering. Milestone: comprehensive test results, acceptable performance benchmarks, user satisfaction indicators, optimized systems.

**Month 6—Documentation and Refinement:** Produce technical documentation, create user guides, document API specifications and schemas, prepare deployment guides, conduct final testing, address remaining issues, and prepare presentation materials. Milestone: complete project documentation, polished applications ready for demonstration, effective presentation materials.

## 9. Expected Outcomes and Contributions

The project delivers three fully functional platforms demonstrating contemporary AI integration approaches, comprehensive documentation, and empirical evidence regarding AI technique effectiveness.

**WrenCos** represents a complete modern e-commerce solution integrating conversational AI for customer service, live streaming commerce with real-time interaction, AI-powered product recommendations, and automated email marketing. This demonstrates how multiple AI capabilities integrate cohesively into e-commerce experiences, providing practical evidence of feasibility, challenges, and user value.

**Skin Study** delivers an accessible dermatology consultation system utilizing RAG technology with specialized medical knowledge bases. This demonstrates that RAG can provide reliable, evidence-based medical information when properly implemented with authoritative sources, while multi-modal input processing through text, voice, and visual analysis via Gemini Vision API significantly enhances consultation accessibility. The implementation of intelligent image handling with temporary blob URLs for preview and automatic cleanup mechanisms prevents memory leaks while maintaining user privacy through immediate deletion after analysis. Vector databases enable efficient semantic search across specialized knowledge bases, and optimized text-to-speech with sentence-by-sentence streaming reduces initial audio playback delay by eighty-three percent. The system provides comprehensive responses grounded in professional medical literature with automatic markdown and citation filtering for clean speech output.

**Track Nutrition** provides an intelligent nutrition tracking solution reducing user burden through AI automation while maintaining accuracy through comprehensive database integration. This demonstrates practical computer vision for food recognition, natural language processing for extracting structured information, and integration of multiple data sources for comprehensive nutrition analysis.

Beyond individual platforms, the project contributes broader insights into cross-platform development strategies for AI-powered applications, architectural approaches supporting real-time communication with AI systems, integration patterns for multiple AI services, and evaluation methodologies for assessing AI system quality.

The academic contribution encompasses detailed implementation documentation, challenges encountered, and solutions developed, providing valuable reference material. The project demonstrates contemporary AI technologies are sufficiently mature for practical applications while identifying remaining challenges and advancement opportunities, contributing practical evidence regarding effort, complexity, and outcomes for developing sophisticated AI-powered applications.

## 10. LSEPI Considerations and Risks

### Legal, Social, Ethical, and Professional Issues

The dermatology platform must clearly communicate AI-generated advice is informational, not diagnostic, does not replace professional medical consultation, and should not be used for emergencies. The system implements appropriate disclaimers, provides referral information, and employs conservative response strategies prioritizing user safety.

Data privacy requires protection through authentication and authorization systems, encrypted data transmission using HTTPS, secure password storage using industry-standard hashing, and clear privacy policies explaining data collection and usage. Comprehensive GDPR compliance requires additional legal review beyond academic project scope.

Social considerations include potential impacts on existing businesses and professional practices. The e-commerce platform could affect traditional retail while creating opportunities for small businesses through live streaming. The dermatology platform increases health information accessibility while potentially reducing demand for in-person consultations for minor concerns, appropriately directing serious cases to professionals. The nutrition platform promotes health awareness while recognizing excessive tracking can contribute to disordered eating, requiring thoughtful design encouraging healthy relationships with food.

Professional considerations include adherence to software engineering best practices, respect for intellectual property rights, and appropriate attribution. The project implements documented API contracts, follows code quality standards, maintains comprehensive version control, and properly attributes external libraries, frameworks, and data sources according to licenses. Medical knowledge sources are properly cited with appropriate copyright considerations.

### Risk Analysis and Mitigation Strategies

**Technical Risks:** AI service dependencies create risk if external APIs experience downtime or policy changes. Mitigation includes graceful degradation allowing basic functionality without AI features, caching responses, monitoring usage to avoid rate limits, and awareness of alternative providers. Vector database performance risks are mitigated through comprehensive testing, optimization of embeddings and indexing, caching layers, and fallback to simpler search. Integration complexity is addressed through modular architecture, comprehensive API documentation, staged integration, and adequate time allocation.

**Data Risks:** USDA database may contain inaccurate or incomplete data; web scraping risks quality issues or access restrictions. Mitigation includes data validation procedures, user feedback mechanisms for reporting issues, multiple data source integration providing redundancy, and clear communication of limitations.

**Time Management Risks:** Underestimation of complexity, unexpected challenges, and feature creep are mitigated through realistic estimation with buffers, regular progress assessment, prioritization of core features, and willingness to adjust scope. High likelihood but manageable impact through agile methodology and clear prioritization.

**User Acceptance Risks:** Potential usability issues or limited perceived value despite technical success. Mitigation includes iterative design with early user feedback, usability testing throughout development, focus on solving real problems rather than showcasing technology, and continuous evaluation of feature utility. Moderate likelihood with potentially high impact, addressed through continuous user-centered design activities.

## 11. References

Amershi, S., Begel, A., Bird, C., DeLine, R., Gall, H., Kamar, E., Nagappan, N., Nushi, B. and Zimmermann, T. (2019) 'Software engineering for machine learning: A case study', in *2019 IEEE/ACM 41st International Conference on Software Engineering: Software Engineering in Practice (ICSE-SEIP)*. Montreal, QC, Canada: IEEE, pp. 291-300.

Banker, K., Garrett, D., Bakkum, P. and Verch, S. (2016) *MongoDB in Action: Covers MongoDB version 3.0*. 2nd edn. Shelter Island, NY: Manning Publications.

Biørn-Hansen, A., Majchrzak, T.A. and Grønli, T.M. (2017) 'Progressive web apps: The possible web-native unifier for mobile development', in *Proceedings of the 13th International Conference on Web Information Systems and Technologies*. Porto, Portugal: SCITEPRESS, pp. 344-351.

Bol, N., Dienlin, T., Kruikemeier, S., Sax, M., Boerman, S.C., Strycharz, J., Helberger, N. and de Vreese, C.H. (2018) 'Understanding the effects of personalization as a privacy calculus: Analyzing self-disclosure across health, news, and commerce contexts', *Journal of Computer-Mediated Communication*, 23(6), pp. 370-388.

Chui, M., Manyika, J., Miremadi, M., Henke, N., Chung, R., Nel, P. and Malhotra, S. (2018) *Notes from the AI frontier: Insights from hundreds of use cases*. McKinsey Global Institute Discussion Paper. Available at: https://www.mckinsey.com/featured-insights/artificial-intelligence (Accessed: 3 November 2025).

Cordeiro, F., Epstein, D.A., Thomaz, E., Bales, E., Jagannathan, A.K., Abowd, G.D. and Fogarty, J. (2015) 'Barriers and negative nudges: Exploring challenges in food journaling', in *Proceedings of the 33rd Annual ACM Conference on Human Factors in Computing Systems*. Seoul, Korea: ACM, pp. 1159-1162.

Davenport, T.H. and Ronanki, R. (2018) 'Artificial intelligence for the real world', *Harvard Business Review*, 96(1), pp. 108-116.

Eisenman, B. (2015) *Learning React Native: Building Native Mobile Apps with JavaScript*. Sebastopol, CA: O'Reilly Media.

Eldridge, A.L., Piernas, C. and Illner, A.K. (2019) 'Evaluation of new technology-based tools for dietary intake assessment: An ILSI Europe Dietary Intake and Exposure Task Force evaluation', *Nutrients*, 11(1), 55.

Esteva, A., Kuprel, B., Novoa, R.A., Ko, J., Swetter, S.M., Blau, H.M. and Thrun, S. (2017) 'Dermatologist-level classification of skin cancer with deep neural networks', *Nature*, 542(7639), pp. 115-118.

Esteva, A., Chou, K., Yeung, S., Naik, N., Madani, A., Mottaghi, A., Liu, Y., Topol, E., Dean, J. and Socher, R. (2019) 'Deep learning-enabled medical computer vision', *npj Digital Medicine*, 4(1), 5.

Ferrara, G., Kim, J., Lin, S., Hua, J. and Seto, E. (2019) 'A focused review of smartphone diet-tracking apps: Usability, functionality, coherence with behavior change theory, and comparative validity of nutrient intake and energy estimates', *JMIR mHealth and uHealth*, 7(5), e9232.

Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Dai, Y., Sun, J. and Wang, H. (2023) 'Retrieval-augmented generation for large language models: A survey', *arXiv preprint arXiv:2312.10997*.

Google DeepMind (2023) *Gemini: A family of highly capable multimodal models*. Technical Report. Available at: https://deepmind.google/technologies/gemini (Accessed: 3 November 2025).

Grewal, D., Roggeveen, A.L. and Nordfält, J. (2017) 'The future of retailing', *Journal of Retailing*, 93(1), pp. 1-6.

GSMA (2020) *The Mobile Economy 2020*. London: GSMA Intelligence.

Hay, R.J., Johns, N.E., Williams, H.C., Bolliger, I.W., Dellavalle, R.P., Margolis, D.J., Marks, R., Naldi, L., Weinstock, M.A., Wulf, S.K. and Michaud, C. (2014) 'The global burden of skin disease in 2010: An analysis of the prevalence and impact of skin conditions', *Journal of Investigative Dermatology*, 134(6), pp. 1527-1534.

Johnson, J., Douze, M. and Jégou, H. (2019) 'Billion-scale similarity search with GPUs', *IEEE Transactions on Big Data*, 7(3), pp. 535-547.

Kumar, G. and Bhatia, P.K. (2014) 'Comparative analysis of software engineering models from traditional to modern methodologies', in *2014 Fourth International Conference on Advanced Computing & Communication Technologies*. Rohtak, India: IEEE, pp. 189-196.

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.T., Rocktäschel, T. and Riedel, S. (2020) 'Retrieval-augmented generation for knowledge-intensive NLP tasks', *Advances in Neural Information Processing Systems*, 33, pp. 9459-9474.

Macrae, C. (2018) *Vue.js: Up and Running: Building Accessible and Performant Web Apps*. Sebastopol, CA: O'Reilly Media.

McConnell, S. (2019) *Software Estimation: Demystifying the Black Art*. 2nd edn. Redmond, WA: Microsoft Press.

Min, W., Jiang, S., Liu, L., Rui, Y. and Jain, R. (2019) 'A survey on food computing', *ACM Computing Surveys*, 52(5), pp. 1-36.

Narla, S., Lyons, A.B., Kohli, I. and Hamzavi, I.H. (2018) 'The importance of the patient-physician relationship in melanoma and considerations for improving care in patients with skin of color', *International Journal of Women's Dermatology*, 4(1), pp. 72-75.

Nielsen, J. (2019) *Response time limits*. Nielsen Norman Group. Available at: https://www.nngroup.com/articles/response-times-3-important-limits/ (Accessed: 3 November 2025).

Nielsen, J. and Molich, R. (1990) 'Heuristic evaluation of user interfaces', in *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems*. Seattle, WA: ACM, pp. 249-256.

Qdrant (2023) *Qdrant Vector Database Documentation*. Available at: https://qdrant.tech/documentation/ (Accessed: 3 November 2025).

Richardson, C. (2018) *Microservices Patterns: With Examples in Java*. Shelter Island, NY: Manning Publications.

USDA (2021) *FoodData Central Documentation*. United States Department of Agriculture. Available at: https://fdc.nal.usda.gov/help.html (Accessed: 3 November 2025).

WHO (2020) *Obesity and overweight fact sheet*. World Health Organization. Available at: https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight (Accessed: 3 November 2025).

Wongkitrungrueng, A. and Assarut, N. (2020) 'The role of live streaming in building consumer trust and engagement with social commerce sellers', *Journal of Business Research*, 117, pp. 543-556.

Zhang, Y., Xu, Y., Liu, H. and Lim, E.P. (2020) 'RES: Regularized stochastic BFGS for large-scale machine learning', *ACM Transactions on Information Systems*, 38(2), pp. 1-31.


