# Rahat Setu — Design Guidelines & UI/UX Standards

> **Core Mantra**: Avoid "Zombie UI" — Stop building generic, soulless interfaces.

These design principles guide all client development across **Visitor Mobile App**, **Visitor Web Portal**, and **Organizer Command Center**.

---

### The 5 Core Tenets

#### 1. Refuse to Confuse Done with Good
* Speed and visual polish do not equal quality.
* A screen isn't complete just because it runs without errors.
* Test against realistic physical contexts: Is it usable in bright direct sunlight? In a crowded, noisy corridor? When someone's hand is shaking during an emergency?

#### 2. Have a Clear POV (Point of View)
* Reject bland, cookie-cutter "white card on grey background" templates.
* Choose purposeful typography, clear visual hierarchy, and distinct contrast levels.
* Distinguish clearly between calm information (schedule updates) and urgent alerts (crowd bottleneck, exit divert, medical emergency).

#### 3. Encode Intent
* Define design tokens (colors, semantic badges, spacing scales, typography) and reuse them consistently.
* Ensure cohesive iconography and mental models across Web, Admin, and Mobile.

#### 4. Embrace Post-Build Editing
* Review and refine after initial implementation.
* Polish micro-interactions, spring transitions, empty states, error states, and tactile feedback.
* Ensure generous touch targets (minimum 48×48 dp) so users can tap accurately while walking or in dense crowds.

#### 5. Raise the Ceiling
* Don't just make standard lists and basic forms faster — invent interfaces that fit the problem:
  * Glanceable queue meters (color-coded, estimated minutes with confidence level).
  * Real-time spatial heatmaps with bottleneck prediction warnings.
  * One-tap, high-visibility Emergency SOS triggers with instant visual confirmation.
  * Context-aware home dashboard that adapts based on user location and time.
