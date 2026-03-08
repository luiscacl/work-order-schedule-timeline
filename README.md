## Running the project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
ng serve
```

Then open:

```text
http://localhost:4200/
```

The app reloads automatically while developing.

## Setup notes

This project does not require a backend or any external API. Everything needed for the challenge is included locally in the app.

Work centers and work orders are provided as hardcoded seed data so the project can be reviewed immediately, with the focus staying on scheduling logic, interactions, and UI implementation.

The design references use **Circular Std**. If needed, the font can be loaded with:

```html
<link
  rel="stylesheet"
  href="https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css"
/>
```

And then applied in SCSS like this:

```scss
font-family: 'Circular-Std';
```

## Approach

I tried to keep the feature easy to follow, so I split it into small standalone Angular components with clear responsibilities.

The shell component owns the main state of the page, including the selected timescale, drawer mode, and current list of work orders. The timeline grid is responsible for the scheduling logic as generating the visible range, placing bars, and translating click positions into dates. The drawer handles form state and validation, while smaller pieces like the work order bar and timescale selector stay focused on UI behavior.

The main technical decision was to base the timeline on date-to-pixel and pixel-to-date calculations instead of fixed positions. That made it easier to keep the same interaction model across all zoom levels. Once that mapping is consistent, bar placement, click-to-create behavior, and the current day indicator all become much easier to manage.

The trickiest part is month view, because months do not all have the same number of days. To keep that view feeling natural, positioning is handled proportionally inside each month instead of assuming every month has the same length.

I also kept the state local to the feature instead of adding heavier state management. For this challenge, the feature is self-contained, the data flow is easier to review, and the create, edit, and delete logic stays straightforward.

## Libraries used

This implementation keeps library usage intentionally light and close to the challenge requirements.

**Angular Forms** is used for the create and edit drawer with Reactive Forms, validators, and cross-field validation.

**`@ng-select/ng-select`** is used for select inputs like timescale and status. It was part of the requested stack and keeps dropdown behavior simple.

**`@ng-bootstrap/ng-bootstrap`** is used for the datepicker in the drawer, matching the requirement to use `ngb-datepicker`.

**Bootstrap** is included as a lightweight styling base and to support ng-bootstrap components cleanly.

## Validation behavior

The drawer form validates the required fields and the scheduling rules from the challenge.

A work order cannot be saved unless it has a name, a status, a start date, and an end date. The end date must be later than the start date. On top of that, work orders assigned to the same work center are not allowed to overlap. If the user tries to create or edit a work order that conflicts with another order on the same row, the form shows an error and prevents saving.

When editing an existing work order, the overlap check excludes the item being edited so unchanged ranges do not conflict with themselves.

## Sample data

The project includes local sample data that follows the document structure requested in the challenge.

There are at least five work centers with manufacturing-style names, at least eight work orders, all four status types are represented, and at least one work center contains multiple non-overlapping orders.

## Project structure

```text
src/
  app/
    core/
      models/
      utils/
    work-order-schedule/
      components/
        schedule-shell/
        timeline-grid/
        timescale-select/
        work-order-bar/
        work-order-drawer/
      data/
```

The `core` folder contains shared models and date utilities. The `data` folder contains the seed documents. The feature components live inside `work-order-schedule/components`, with the shell acting as the main container and the other components handling more focused UI responsibilities.

## Notes on implementation

Most of the complexity in this challenge lives in the timeline calculations rather than in the form itself.

The main implementation work is around calculating the visible range for each scale, converting dates into horizontal positions, converting pointer positions back into dates, handling proportional positioning in month view, and validating overlap only within the same work center.

## AI usage

AI was used as a support tool during implementation, mainly to think through parts of the date math and speed up iteration while exploring timeline behavior.

The final structure, interaction flow, and implementation details were still reviewed and adjusted manually to match the challenge requirements and the intended UI behavior.
