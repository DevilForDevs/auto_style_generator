import * as vscode from "vscode";
import * as path from "path";

export async function handleReactWeb(editor: vscode.TextEditor, text: string, doc: vscode.TextDocument) {
    // 1️⃣ Parse import alias and path
    const importRegex = /import\s+(\w+)\s+from\s+["'](.+?\.module\.css)["']/;
    const importMatch = importRegex.exec(text);

    if (!importMatch) {
        vscode.window.showInformationMessage("No CSS module import found (expected `import X from \"...module.css\"`).");
        return;
    }

    const alias = importMatch[1]; // e.g. "style" or "styles"
    const importPath = importMatch[2]; // e.g. "./Section2.module.css"

    // 2️⃣ Find all alias.className usages
    const usedClasses = new Set<string>();
    const usageRegex = new RegExp(`${alias}\\.([a-zA-Z0-9_-]+)`, "g");
    let match: RegExpExecArray | null;
    while ((match = usageRegex.exec(text)) !== null) {
        usedClasses.add(match[1]);
    }

    if (usedClasses.size === 0) {
        vscode.window.showInformationMessage("No module css classes found in this file.");
        return;
    }

    // 3️⃣ Resolve css path
    const tsxDir = path.dirname(doc.uri.fsPath);
    const cssPath = path.resolve(tsxDir, importPath);
    const cssUri = vscode.Uri.file(cssPath);

    // 4️⃣ Read or create css file
    let cssText = "";
    try {
        const cssDoc = await vscode.workspace.openTextDocument(cssUri);
        cssText = cssDoc.getText();
    } catch {
        await vscode.workspace.fs.writeFile(cssUri, Buffer.from("", "utf8"));
        cssText = "";
        vscode.window.showInformationMessage(`Created ${cssUri.fsPath}`);
    }

    // 5️⃣ Existing classes
    const existingClasses = new Set(
        Array.from(cssText.matchAll(/\.([\w-]+)\s*{/g)).map(m => m[1])
    );

    // 6️⃣ Build missing rules
    let missingRules = "";
    usedClasses.forEach(cls => {
        if (!existingClasses.has(cls)) {
            missingRules += `\n.${cls} {\n    \n}\n`;
        }
    });

    if (!missingRules) {
        vscode.window.showInformationMessage("All classes already exist in CSS module.");
        return;
    }

    // 7️⃣ Insert into css
    const cssDoc = await vscode.workspace.openTextDocument(cssUri);
    const cssEditor = await vscode.window.showTextDocument(cssDoc, { preview: false });
    const pos = cssDoc.lineAt(cssDoc.lineCount - 1).range.end;

    await cssEditor.edit(editBuilder => {
        editBuilder.insert(pos, missingRules);
    });
}
