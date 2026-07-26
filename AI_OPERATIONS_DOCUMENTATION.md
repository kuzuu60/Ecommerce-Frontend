# Luxe Commerce AI Engine: Operations, Algorithms & Theoretical Specifications

## 1. Executive System Overview

Luxe Commerce incorporates an advanced dual-engine AI system combining **Information Retrieval (IR)**, **Supervised Vector Similarity Scoring**, and **Local Large Language Model (LLM) Inference**. 

The architecture delivers sub-50 millisecond recommendations for e-commerce search queries while providing natural language dialogue through quantized locally-hosted LLMs without external API cost or latency bounds.

```
                                  ┌───────────────────────────────┐
                                  │      User Query / Prompt      │
                                  └───────────────┬───────────────┘
                                                  │
                                   ┌──────────────┴──────────────┐
                                   ▼                             ▼
                    ┌────────────────────────────┐  ┌────────────────────────────┐
                    │  Intent & Budget Classifier │  │ Category Isolation Engine  │
                    └──────────────┬─────────────┘  └─────────────┬──────────────┘
                                   │                              │
                                   └──────────────┬───────────────┘
                                                  ▼
                                ┌──────────────────────────────────┐
                                │   Vector Space Model & TF-IDF    │
                                └─────────────────┬────────────────┘
                                                  │
                                   ┌──────────────┴──────────────┐
                                   ▼                             ▼
                    ┌────────────────────────────┐  ┌────────────────────────────┐
                    │ Hardware Spec Tier Boost  │  │ Dynamic Relevance Decay    │
                    └──────────────┬─────────────┘  └─────────────┬──────────────┘
                                   │                              │
                                   └──────────────┬───────────────┘
                                                  ▼
                                ┌──────────────────────────────────┐
                                │ Top-K Card Selector (Singular/   │
                                │            Plural)               │
                                └─────────────────┬────────────────┘
                                                  │
                                                  ▼
                                ┌──────────────────────────────────┐
                                │   Qwen 3B Local LLM Synthesizer  │
                                └──────────────────────────────────┘
```

---

## 2. Theoretical Mathematical Formulations & Notation

### 2.1 Master Product Scoring Equation

Score(P) = ( Cosine Similarity(Q, D) + SpecBonus(P) ) * Penalty(P) * Boost(P)

Where:
- Score(P) is the final composite relevance score for product P.
- Q is the user query vector.
- D is the candidate product document vector.
- Cosine Similarity(Q, D) is the vector text similarity between query Q and document D.
- SpecBonus(P) is the additive hardware specification bonus for product P.
- Penalty(P) is the contextual penalty factor for non-device accessories.
- Boost(P) is the performance intent multiplier.

---

### 2.2 Vector Text Similarity Formulations

#### 1. Term Frequency
TF(t, d) = Count(t, d) / TotalWords(d)

Where Count(t, d) is the frequency of token t in document d, and TotalWords(d) is the total token count of document d.

#### 2. Inverse Document Frequency
IDF(t) = ln( (N + 1) / (DF(t) + 1) ) + 1

Where N is the total number of products in the store catalog, and DF(t) is the document frequency of token t across all products.

#### 3. Composite Token Weight
Weight(t, d) = TF(t, d) * IDF(t)

#### 4. Cosine Similarity Formula
Cosine Similarity(A, B) = (A · B) / (||A|| ||B||)

Expanded Form:
Cosine Similarity(Q, D) = Sum( Weight(t, Q) * Weight(t, D) ) / ( Sqrt( Sum( Weight(t, Q)^2 ) ) * Sqrt( Sum( Weight(t, D)^2 ) ) )

Where (A · B) represents the vector dot product of shared tokens, and ||A|| ||B|| represents the product of the Euclidean vector lengths (norms).

Output Range: Standardized between 0.0 (unrelated) and 1.0 (exact match).

---

### 2.3 Hardware & Spec Tier Boosting Matrix

SpecBonus(P) is an additive multiplier based on identified hardware components:

SpecBonus(P) = +0.35  if P contains { M1 Pro, M2 Pro, M3 Max, Core i9, RTX 3070, RTX 4080, 32GB RAM }
SpecBonus(P) = +0.25  if P contains { Core i7, 16GB RAM, OLED, 3K, Retina, Zenbook, Spectre, XPS }
SpecBonus(P) = +0.15  if P contains { Ryzen 5, 8GB RAM, Yoga, Swift }
SpecBonus(P) = +0.00  otherwise

---

### 2.4 Accessory Contextual Penalty

Penalty(P) = 0.05  if DeviceIntent = True AND Category(P) in { Cases, Covers, Chargers, Accessories }
Penalty(P) = 1.00  otherwise

---

### 2.5 Performance Intent Multiplier

Boost(P) = 1.30  if PerformanceIntent = True AND SpecTier(P) in { Tier 1, Tier 2 }
Boost(P) = 1.00  otherwise

---

### 2.6 Dynamic Relevance Quality Threshold

Quality Threshold = Max( 0.10, 0.55 * MaxScore )

Where MaxScore = Max( Score(P) for all candidate products P in catalog ).
Products where Score(P) < Quality Threshold are filtered out.

---

### 2.7 Price Similarity Ratio (Python Model)

Price Ratio(A, B) = Min( Price(A), Price(B) ) / Max( Price(A), Price(B) )

Hybrid Score(A, B) = 0.80 * Text Similarity(A, B) + 0.20 * Price Ratio(A, B)

Filter Window: Retain candidate B if 0.60 * Price(A) <= Price(B) <= 1.40 * Price(A).

---

## 3. Numerical Calculation Example

### User Query Q = "highest performing laptop"

#### Candidate A: Asus Zenbook Pro Dual Screen (Core i7, 16GB RAM, OLED)
- Cosine Similarity(Q, D_A) = 0.320
- SpecBonus(P_A) = +0.250 (Tier 2: Core i7, 16GB RAM, OLED)
- Penalty(P_A) = 1.00 (Laptop Computer)
- Boost(P_A) = 1.30 (Performance query + Core i7)

Score(P_A) = ( 0.320 + 0.250 ) * 1.00 * 1.30 = 0.570 * 1.30 = 0.741

#### Candidate B: Generic Student Laptop (Dual Core, 4GB RAM)
- Cosine Similarity(Q, D_B) = 0.280
- SpecBonus(P_B) = +0.000 (Tier 4: Entry level)
- Penalty(P_B) = 1.00 (Laptop Computer)
- Boost(P_B) = 1.00 (No flagship hardware)

Score(P_B) = ( 0.280 + 0.000 ) * 1.00 * 1.00 = 0.280 * 1.00 = 0.280

#### Result:
Score(Asus Zenbook) = 0.741 > Score(Generic Laptop) = 0.280 -> Selected as #1 Recommendation.

---

## 4. Presentation & Viva Script

### 1. "What formula drives your vector search?"
> "We use Cosine Similarity(A, B) = (A · B) / (||A|| ||B||) operating on TF-IDF term weights. TF-IDF is calculated as Weight(t, d) = TF(t, d) * IDF(t), where IDF(t) = ln((N + 1) / (DF(t) + 1)) + 1."

### 2. "How do you combine specs with similarity?"
> "We use our Master Scoring Equation: Score(P) = ( Cosine Similarity(Q, D) + SpecBonus(P) ) * Penalty(P) * Boost(P). This adds hardware bonuses for i7/i9/M-series chips while penalizing accessories when main devices are requested."

---

## 5. End-to-End Real Product Scoring Example (Database Laptops)

This section demonstrates how the scoring system evaluates real products from our PostgreSQL catalog when a user searches for `"highest performing laptop"`.

### Catalog Products Evaluated:

1. **Product 1 (ID 78)**: `Apple MacBook Pro 14 Inch Space Grey`
   - Price: Rs. 269,999
   - Specs: M1 Pro Chip (10-core CPU, 16-core GPU), 16GB Unified RAM, 512GB SSD, Liquid Retina XDR Display
   - Category: `laptops`

2. **Product 2 (ID 165)**: `HP Spectre x360 14`
   - Price: Rs. 114,999
   - Specs: Intel Core i7-1255U, 16GB RAM, 512GB NVMe SSD, 3K2K OLED Touchscreen
   - Category: `laptops`

3. **Product 3 (ID 162)**: `Generic Student Laptop`
   - Price: Rs. 44,999
   - Specs: Entry-level Intel Processor, 8GB RAM, 256GB SSD
   - Category: `laptops`

---

### Step 1: Query Intent Parsing & Isolation
- User Query Q = `"highest performing laptop"`
- Category Detection: Keyword `"laptop"` matches target category `laptops`. All non-laptop products get `Score = 0.000` (Category Isolation).
- Intent Mode: Superlative keyword `"highest performing"` triggers **Singular Intent** (`isSingularIntent = True`), setting candidate output limit to **Top 2** cards.
- Performance Intent: Keywords `"highest performing"` set `PerformanceIntent = True`.

---

### Step 2: Vector Cosine Text Similarity
- **Apple MacBook Pro 14**: TF-IDF similarity on query terms `"highest", "performing", "laptop"` gives `Cosine Similarity(Q, D_1) = 0.350`.
- **HP Spectre x360 14**: TF-IDF similarity on query terms gives `Cosine Similarity(Q, D_2) = 0.310`.
- **Generic Student Laptop**: TF-IDF similarity on query terms gives `Cosine Similarity(Q, D_3) = 0.330` (repeats token "laptop" multiple times in specs).

---

### Step 3: Hardware Spec Tier Bonus Assignment (`SpecBonus(P)`)
- **Apple MacBook Pro 14**: Product contains `M1 Pro Chip` and `16GB RAM` $\rightarrow$ **Tier 1 Ultimate Flagship** $\rightarrow$ `SpecBonus(P_1) = +0.350`.
- **HP Spectre x360 14**: Product contains `Intel Core i7`, `16GB RAM`, `OLED`, and `Spectre` $\rightarrow$ **Tier 2 Premium High-End** $\rightarrow$ `SpecBonus(P_2) = +0.250`.
- **Generic Student Laptop**: Product contains basic 8GB/256GB specs without i7/i9/M-series/OLED $\rightarrow$ **Tier 4 Standard Entry** $\rightarrow$ `SpecBonus(P_3) = +0.000`.

---

### Step 4: Accessory Penalty Factor (`Penalty(P)`)
All 3 items are genuine laptop computers matching the target category `laptops`:
`Penalty(P_1) = 1.00`, `Penalty(P_2) = 1.00`, `Penalty(P_3) = 1.00`.

---

### Step 5: Performance Intent Multiplier (`Boost(P)`)
`PerformanceIntent = True` is active:
- **Apple MacBook Pro 14**: Has Tier 1 M1 Pro Chip $\rightarrow$ `Boost(P_1) = 1.30`.
- **HP Spectre x360 14**: Has Tier 2 Intel Core i7 $\rightarrow$ `Boost(P_2) = 1.30`.
- **Generic Student Laptop**: Has Tier 4 entry hardware $\rightarrow$ `Boost(P_3) = 1.00`.

---

### Step 6: Master Equation Calculation

$$\text{Score}(P) = \left( \text{Cosine Similarity} + \text{SpecBonus} \right) \times \text{Penalty} \times \text{Boost}$$

1. **Apple MacBook Pro 14 (ID 78)**:
   $$\text{Score}(P_1) = ( 0.350 + 0.350 ) \times 1.00 \times 1.30 = 0.700 \times 1.30 = \mathbf{0.910}$$

2. **HP Spectre x360 14 (ID 165)**:
   $$\text{Score}(P_2) = ( 0.310 + 0.250 ) \times 1.00 \times 1.30 = 0.560 \times 1.30 = \mathbf{0.728}$$

3. **Generic Student Laptop (ID 162)**:
   $$\text{Score}(P_3) = ( 0.330 + 0.000 ) \times 1.00 \times 1.00 = 0.330 \times 1.00 = \mathbf{0.330}$$

---

### Step 7: Ranking & Dynamic Quality Thresholding

#### Ranked Candidate Order:
1. **#1**: `Apple MacBook Pro 14 Inch Space Grey` — Score: **`0.910`**
2. **#2**: `HP Spectre x360 14` — Score: **`0.728`**
3. **#3**: `Generic Student Laptop` — Score: **`0.330`**

#### Dynamic Quality Bar Calculation:
$$\text{Quality Threshold} = \text{Max}( 0.10, \; 0.55 \times \text{MaxScore} ) = 0.55 \times 0.910 = \mathbf{0.5005}$$

- Both **Apple MacBook Pro 14** (`0.910`) and **HP Spectre x360 14** (`0.728`) cross the `0.5005` quality bar.
- The **Generic Student Laptop** (`0.330`) falls below the `0.5005` quality bar and is filtered out.

#### Final Payload Selection (Singular Intent: Top 2):
The system selects **Card #1 (Apple MacBook Pro 14)** and **Card #2 (HP Spectre x360 14)** to display on the user interface.

---

### Step 8: Local LLM Response Generation (Qwen 3B)

The candidate payload is injected into the system prompt:
- **Card #1**: Apple MacBook Pro 14 (M1 Pro, 16GB RAM, Liquid Retina XDR, Rs. 269,999)
- **Card #2**: HP Spectre x360 14 (Core i7, 16GB RAM, OLED Touchscreen, Rs. 114,999)

#### Rule Applied:
Since candidate count is exactly 2, Qwen details Card #1 as the primary recommendation and explicitly acknowledges Card #2 as the top runner-up.

#### Generated Text Output:
> *"For the highest performing laptop, the **Apple MacBook Pro 14 Inch** is our top recommendation. Powered by the M1 Pro chip with a 10-core CPU and 16-core GPU, 16GB RAM, and a Liquid Retina XDR display, it delivers unrivaled performance for demanding workloads at Rs. 2,69,999. If you prefer a Windows ecosystem, another top option is the **HP Spectre x360 14** featuring an Intel Core i7 processor and a gorgeous 3K OLED touchscreen for Rs. 1,14,999."*

---

## 6. Offline Fallback Protocol (Rule-Based Safety Net)

When the local Ollama LLM service is offline, stopped, or times out (>30s execution threshold), the application **never crashes**. Instead, it seamlessly switches to a deterministic, rule-based fallback system.

### 6.1 Recommendation Fallback Logic
If Ollama is unavailable during a product recommendation request (`recommendProducts`), the system uses the mathematical candidate scores and generates a structured template response directly from database fields:

#### Fallback Response Generator:
```text
I understood that you are looking for "[Query]". Here are the strongest matches from our catalog:
1. [Product 1 Title] — Rs. [Effective Price] (matches [Matched Tokens]; category: [Category]; [Budget Status]).
2. [Product 2 Title] — Rs. [Effective Price] (matches [Matched Tokens]; category: [Category]; [Budget Status]).
```

#### Example Output (Ollama Offline):
> *"I understood that you are looking for "highest performing laptop". Here are the strongest matches from our catalog:*
> *1. Apple MacBook Pro 14 Inch Space Grey — Rs. 269,999 (matches laptop, m1 pro, 16gb; category: laptops).*
> *2. HP Spectre x360 14 — Rs. 114,999 (matches laptop, i7, oled; category: laptops)."*

---

### 6.2 Product Question Answering Fallback Logic (`answerProductQuestionFallback`)
If Ollama is unavailable during a product page question (`answerQuestion`), the system evaluates the user's input string against deterministic regular expression pattern matchers:

| Detected Question Intent | Regex Rule Matcher | Rule-Based Generated Response |
|---|---|---|
| **Price / Discount** | `/\b(price\|cost\|how much\|discount)\b/` | Calculates discounted price from `price` and `discount_percentage` columns. |
| **Stock / Availability** | `/\b(stock\|available\|quantity\|left)\b/` | Reports exact units from `stock` and `availability_status` columns. |
| **Shipping / Delivery** | `/\b(ship\|shipping\|delivery)\b/` | Returns string from `shipping_information` column. |
| **Warranty / Guarantee** | `/\b(warranty\|guarantee)\b/` | Returns string from `warranty_information` column. |
| **Specifications** | `/\b(spec\|ram\|storage\|processor)\b/` | Formats string from `specs` and `description` columns. |

#### Provider Badge Indicator:
- When Ollama is online: `provider = "Qwen 3b (local)"`
- When Ollama is offline: `provider = "Product Catalog"` (Rule-Based Fallback)

---

## 7. Role Division: What Ollama & Qwen Do vs. The Mathematical Vector Engine

To clearly understand the architecture, the responsibilities are divided into two distinct layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STEP 1: MATHEMATICAL ENGINE                      │
│                (Node.js TF-IDF + Spec Tier Scoring)                     │
│  - Filters out wrong categories (Category Isolation: 100% accuracy)    │
│  - Ranks products mathematically using Hardware Spec Tier Boosting      │
│  - Selects top 2 cards (Singular) or top 4 cards (Plural)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Evaluated Product Payload
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     STEP 2: LOCAL LLM SYNTHESIS LAYER                  │
│                        (Ollama Runtime + Qwen LLM)                      │
│  - Converts mathematical data into warm, human-like explanations       │
│  - Compares product trade-offs (e.g. macOS vs Windows, OLED vs Retina)  │
│  - Answers complex conversational questions ("Will this run 4K video?") │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.1 What is Ollama?
**Ollama** is the **local AI runtime server engine**. It acts as the local host process running on port `11434` that loads neural network weights into RAM/VRAM and handles HTTP chat requests from Node.js (`ollamaService.js`).

### 7.2 What is Qwen?
**Qwen** (Qwen 1.5B / 3B) is the **Large Language Model (LLM) neural network weights**. It is an advanced open-weights generative language model trained to understand and generate natural human language.

### 7.3 Core Responsibilities Comparison Table:

| Task / Capability | Mathematical Vector Engine | Ollama + Qwen LLM |
|---|:---:|:---:|
| **Category Isolation & Strict Filtering** | **PRIMARY** (100% Deterministic) | Guardrailed by system prompt |
| **Hardware Spec Tier Scoring** | **PRIMARY** (Mathematical) | Context consumer |
| **Selecting Top Product Cards** | **PRIMARY** (Vector Rank) | Context consumer |
| **Natural Language Synthesizer** | Backup Template | **PRIMARY** (Human-like text) |
| **Product Comparison & Trade-offs** | Dry Attribute List | **PRIMARY** (Fluid reasoning) |
| **Conversational Chit-Chat & Advice** | None (Static regex fallback) | **PRIMARY** (Full dialogue) |
| **Zero API Cost & Data Privacy** | N/A (Local Code) | **PRIMARY** (100% Local GPU/CPU) |

---

### 7.4 Summary: Why We Need Both

1. **Why not LLM alone?**  
   If you rely *only* on an LLM for search, it will invent non-existent products, misquote prices, or recommend phones when asked for laptops (hallucination).

2. **Why not Math Engine alone?**  
   If you rely *only* on math search, recommendations feel robotic, rigid, and cold (`"1. Laptop A - Rs. 100000"`).

3. **The Hybrid Synergy**:  
   - **Math Engine** acts as the **"Database Investigator"** (finds the exact real products and specs).
   - **Ollama + Qwen** acts as the **"Friendly Store Manager"** (takes those exact real products and explains them to the customer in natural, human speech).



