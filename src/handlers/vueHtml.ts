import * as vscode from "vscode";

export async function handleVueHtml(editor: vscode.TextEditor, text: string, doc: vscode.TextDocument) {
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

    let styleMatch = /<style[^>]*>([\s\S]*?)<\/style>/m.exec(text);
    if (!styleMatch) {
        const endPos = doc.lineAt(doc.lineCount - 1).range.end;
        await editor.edit(editBuilder => {
            editBuilder.insert(endPos, `\n<style>\n</style>\n`);
        });
        return;
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
