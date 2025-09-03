import * as vscode from "vscode";

export async function handleReactNative(editor: vscode.TextEditor, text: string, doc: vscode.TextDocument) {
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
