# Auto Style Generator

A VS Code extension that automatically inserts missing CSS class selectors into the `<style>` block of `.vue` and `.html`,react native tsx files.

## Features
- Collects all `class="..."` attributes in your file
- Adds missing `.classname {}` rules into `<style>`
- Works with a simple hotkey (`Alt+I`)

## Usage
1. Open a `.vue` or `.html` file
2. Press **Alt+I**
3. Missing CSS classes will be added inside the `<style>` tag

## Example
Before:
```html
<div class="btn primary"></div>

<style>
.btn {
  color: red;
}
</style>
Requirements

Works on Vue/HTML files
![2025-08-23 19-29-42_trim_5_49](https://github.com/user-attachments/assets/aee55bff-3235-49f4-807d-8e75f9b47c85)





Keybinding: Alt+I
