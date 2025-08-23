import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("extension.insertMissingClasses", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const text = doc.getText();

        if (["vue", "html"].includes(doc.languageId)) {
            await handleVueHtml(editor, text, doc);
        } else if (["javascript", "javascriptreact", "typescript", "typescriptreact"].includes(doc.languageId)) {
            await handleReactNative(editor, text, doc);
        } else {
            vscode.window.showInformationMessage("Works only in Vue/HTML or React Native files.");
        }
    });

    context.subscriptions.push(disposable);
}

async function handleVueHtml(editor: vscode.TextEditor, text: string, doc: vscode.TextDocument) {
    // 1️⃣ Collect all classes
    const allClasses = new Set<string>();
    const classRegex = /class=["']([^"']*)["']/g;
    let match: RegExpExecArray | null;
    while ((match = classRegex.exec(text)) !== null) {
        match[1].split(/\s+/).forEach(cls => {
            if (cls) allClasses.add(cls);
        });
    }

    if (allClasses.size === 0) {
        vscode.window.showInformationMessage("No classes found.");
        return;
    }

    // 2️⃣ Find or create <style>
    let styleMatch = /<style[^>]*>([\s\S]*?)<\/style>/m.exec(text);
    if (!styleMatch) {
        const endPos = doc.lineAt(doc.lineCount - 1).range.end;
        await editor.edit(editBuilder => {
            editBuilder.insert(endPos, `\n<style>\n</style>\n`);
        });
        return; // re-run once user triggers again
    }

    const styleContent = styleMatch[1];
    const existingClasses = new Set(
        Array.from(styleContent.matchAll(/\.([\w-]+)\s*{/g)).map(m => m[1])
    );

    const styleEndIndex = text.indexOf("</style>");
    const stylePosition = doc.positionAt(styleEndIndex);

    await editor.edit(editBuilder => {
        allClasses.forEach(cls => {
            if (!existingClasses.has(cls)) {
                editBuilder.insert(stylePosition, `\n.${cls}{\n    \n}\n`);
            }
        });
    });
}

async function handleReactNative(editor: vscode.TextEditor, text: string, doc: vscode.TextDocument) {
    // 1️⃣ Find all used styles anywhere in file
    const usedStyles = new Set<string>();
    const usageRegex = /styles\.([a-zA-Z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = usageRegex.exec(text)) !== null) {
        usedStyles.add(match[1]);
    }

    if (usedStyles.size === 0) {
        vscode.window.showInformationMessage("No React Native styles found.");
        return;
    }

    // 2️⃣ Locate StyleSheet.create
    const styleSheetRegex = /const\s+styles\s*=\s*StyleSheet\.create\(\s*{([\s\S]*?)}\s*\)/m;
    const styleMatch = styleSheetRegex.exec(text);
    if (!styleMatch) {
        vscode.window.showInformationMessage("No StyleSheet.create found.");
        return;
    }

    const existingBlock = styleMatch[1];
    const existingKeys = new Set(
        Array.from(existingBlock.matchAll(/([a-zA-Z0-9_]+)\s*:/g)).map(m => m[1])
    );

    const insertIndex = styleMatch.index + styleMatch[0].lastIndexOf("}");
    const insertPosition = doc.positionAt(insertIndex);

    // 3️⃣ Insert missing styles
    await editor.edit(editBuilder => {
        usedStyles.forEach(style => {
            if (!existingKeys.has(style)) {
                const needsComma = existingBlock.trim().length > 0 && !existingBlock.trim().endsWith(",");
                const prefix = needsComma ? ",\n" : "\n";
                editBuilder.insert(insertPosition, `${prefix}    ${style}: {\n        \n    }\n  `);
            }
        });
    });
}


export function deactivate() { }
