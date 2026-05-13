---
name: design-system-personal-computer-for-mac
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Personal Computer for Mac

## Mission
Deliver implementation-ready design-system guidance for Personal Computer for Mac that can be applied consistently across e-commerce storefront interfaces.

## Brand
- Product/brand: Personal Computer for Mac
- URL: https://www.perplexity.ai/personal-computer?ref=onepagelove
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=PPLX Sans`, `font.family.stack=PPLX Sans, -apple-system, Helvetica Neue, sans-serif`, `font.size.base=18px`, `font.weight.base=400`, `font.lineHeight.base=28.8px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=12px`, `font.size.md=14px`, `font.size.lg=15px`, `font.size.xl=16px`, `font.size.2xl=18px`, `font.size.3xl=20px`, `font.size.4xl=22px`
- Color palette: `color.text.primary=#f5f3ed`, `color.text.secondary=#ffffff`, `color.text.tertiary=#b5b3ab`, `color.text.inverse=#27251e`, `color.surface.base=#000000`, `color.surface.muted=#1a1918`, `color.surface.raised=#20808d`, `color.border.default=#60584d`, `color.border.muted=#d6d5d4`
- Spacing scale: `space.1=4px`, `space.2=7px`, `space.3=10px`, `space.4=12px`, `space.5=16px`, `space.6=20px`, `space.7=22px`, `space.8=24px`
- Radius/shadow/motion tokens: `radius.xs=16px`, `radius.sm=9999px` | `shadow.1=rgba(0, 0, 0, 0.08) 0px 2px 8px 0px, rgba(0, 0, 0, 0.08) 0px 8px 32px 0px`, `shadow.2=rgba(32, 128, 141, 0.4) 0px 4px 24px -2px, rgba(32, 128, 141, 0.2) 0px 0px 0px 1px, rgba(255, 255, 255, 0.15) 0px 1px 0px 0px inset`, `shadow.3=rgba(0, 0, 0, 0.08) 0px 2px 8px -2px, rgba(255, 255, 255, 0.5) 0px 1px 0px 0px inset`, `shadow.4=rgba(0, 0, 0, 0.4) 0px 40px 80px 0px, rgba(0, 0, 0, 0.25) 0px 8px 24px 0px` | `motion.duration.instant=120ms`, `motion.duration.fast=180ms`, `motion.duration.normal=240ms`, `motion.duration.slow=250ms`, `motion.duration.slower=300ms`, `motion.duration.step6=600ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
