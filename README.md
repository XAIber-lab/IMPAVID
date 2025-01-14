## Visually Supporting the Assessment of the Incident Management Process

### Abstract

Incident Management (IM) is the process to prevent, protect, and react to incidents affecting an organization and should be well-defined to be prepared in case of alerts. To this aim, security standards define guidelines to manage the incidents and the organizations should comply with them to properly set up a secure-by-design process. Assessing whether an organization is compliant or not with security standards requires a big effort as the main methodologies are based on manual analysis and leveraging automatic approaches to support human decisions is challenging. To facilitate this task, we design IMPAVID, a visual analytics solution to support the assessment of IM process compliance through process mining. The aim is to increase the level of awareness of the security assessor to support her in making informed decisions about actions to improve IM process compliance with regulatory and technical standards. We evaluate the proposed system through a usage scenario based on a publicly available dataset containing data from a real IM log of an IT company.

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

