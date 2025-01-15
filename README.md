## IMPAVID: A Visual Analytics solution for Incident Management Process compliance assessment

### Abstract
The Incident Management Process (IMP) is crucial to prevent, protect against, and respond to security incidents that impact an organization. 
To ensure readiness for potential alerts, the IMP must be compliant with security standards, which provide guidelines for managing such incidents, and organizations are expected to adhere to these standards to establish a secure-by-design approach.
Evaluating an organization’s compliance with security standards is often labor-intensive, as traditional methods rely heavily on manual analysis. Incorporating automated approaches to aid decision-making presents additional challenges such as data interpretation and correlation.
To address these challenges, we present IMPAVID, a visual analytics solution designed to support the assessment of IMP compliance through process-centric techniques. IMPAVID aims to enhance the security assessor’s awareness, enabling them to make informed decisions about improving the IMP alignment with regulatory and technical standards.
To ensure the context-awareness of these techniques, they often rely on parametric non-compliance cost functions, that provide a valuable solution for fine-grained assessments.
On the other hand, they introduce additional challenges related to the effort necessary for security assessors to determine suitable parameter configurations.
Thus, we extend the IMPAVID system with additional requirements and a visual environment to support parameter configuration during IMP compliance assessment.
We validate our system using a comprehensive case study based on a publicly available dataset, which includes real IMP log data from an IT company.
It shows the capabilities of the system to perform IMP compliance assessment while also configuring the parameters of a compliance cost model.

### Link to the paper and demo video

https://diglib.eg.org/handle/10.2312/eurova20241116

### Installation Requirements

The following libraries are necessary for the correct functioning of the system:

- pm4py (https://pm4py.fit.fraunhofer.de/)
- eel (https://pypi.org/project/Eel/)
- d3.js (https://d3js.org/)

### Installation Instructions

#### Alternative 1:

To run a simplified version of the dataset and diagram just run the following command inside the "src" folder:

> python <path_to_backend/main.py>

#### Alternative 2:

To configure different datasets and diagrams (available in the "data" folder), you can change the related parameters in the file:

> backend/main.py

Uncomment the code inside the function "processData", and run the command:

> python <path_to_backend/main.py>

Notice: this will compute the trace alignment of log and model, therefore it may require time (bigger the model, more time needed).

### Paper citation

PALMA, Alessandro; ANGELINI, Marco. Visually Supporting the Assessment of the Incident Management Process. EuroVA 2024.

```
@inproceedings{10.2312:eurova.20241116,
booktitle = {EuroVis Workshop on Visual Analytics (EuroVA)},
editor = {El-Assady, Mennatallah and Schulz, Hans-Jörg},
title = {{Visually Supporting the Assessment of the Incident Management Process}},
author = {Palma, Alessandro and Angelini, Marco},
year = {2024},
publisher = {The Eurographics Association},
ISBN = {978-3-03868-253-0},
DOI = {10.2312/eurova.20241116}
}
```

