%%{init: {'flowchart': {'useMaxWidth': false, 'nodeSpacing': 40, 'rankSpacing': 70}}}%%
flowchart TB

    %% -------------------- SOURCES --------------------
    subgraph Sources["📂 Source Datasets"]
        direction TB
        D1["📸 Clinical Photo Analysis<br/>418 images + OBB labels"]
        D2["🦷 OPG Classification v1+v4<br/>517 images, 6 classes"]
        D3["🦷 OPG Object Detection<br/>232 images + YOLO labels<br/>6 pathology classes"]
        D4["🦷 Panoramic Xray<br/>64 images + annotations"]
        D5["📝 Wildstash 2.5k Instruct<br/>2,494 text-only cases"]
    end

    %% -------------------- PROCESSORS --------------------
    subgraph Processors["⚙️ Preprocessing Scripts"]
        direction TB
        UTIL["answer_builder.py<br/>Compositional generation"]

        P1["process_cavity_detection.py<br/>5 question types<br/>Compositional answers"]
        P2["process_opg_classification.py<br/>5 question types<br/>Compositional answers"]
        P3["process_opg_detection.py<br/>Location-aware VQA<br/>Region mapping"]
        P4["process_panoramic.py<br/>3 question types<br/>Clinical focus"]
        P5["process_text_cases.py"]
    end

    %% -------------------- BUILDER --------------------
    subgraph Builder["🏗️ build_dataset.py"]
        direction TB
        MERGE["Merge & Format<br/>Chat Template<br/>4 VQA sources"]
        SPLIT["Train / Val Split<br/>90 / 10"]
    end

    %% -------------------- OUTPUT --------------------
    subgraph Output["📦 HuggingFace Datasets"]
        direction TB
        VQA["dentalgemma-vqa<br/>~2,529 multimodal pairs<br/>image + messages"]
        INST["dentalgemma-instruct<br/>2,494 text-only cases<br/>messages only"]
    end

    %% Vertical flow between major blocks
    Sources --> Processors
    Processors --> Builder
    Builder --> Output

    %% Internal links
    D1 --> P1
    D2 --> P2
    D3 --> P3
    D4 --> P4
    D5 --> P5

    UTIL -.-> P1
    UTIL -.-> P2
    UTIL -.-> P3
    UTIL -.-> P4

    P1 --> MERGE
    P2 --> MERGE
    P3 --> MERGE
    P4 --> MERGE
    P5 --> MERGE

    MERGE --> SPLIT
    SPLIT --> VQA
    SPLIT --> INST

    style P3 fill:#ccffcc,stroke:#00cc00,stroke-width:2px
    style UTIL fill:#ccffcc,stroke:#00cc00,stroke-width:2px
    style VQA fill:#cce5ff,stroke:#0066cc,stroke-width:2px
