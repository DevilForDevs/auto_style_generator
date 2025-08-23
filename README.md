# Auto Style Generator

A VS Code extension that automatically inserts missing CSS class selectors into the `<style>` block of `.vue` and `.html` files.

## Features
- Collects all `class="..."` attributes in your file
- Adds missing `.classname {}` rules into `<style>`
- Works with a simple hotkey (`Shift+I`)

## Usage
1. Open a `.vue` or `.html` file
2. Press **Shift+I**
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


https://github.com/user-attachments/assets/14af1eed-c2cf-4209-9213-3b348e838f02


Keybinding: Alt+I
