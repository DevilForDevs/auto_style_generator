import * as vscode from "vscode";
import { handleVueHtml } from "./handlers/vueHtml";
import { handleReactNative } from "./handlers/reactNative";
import { handleReactWeb } from "./handlers/reactWeb";

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("extension.insertMissingClasses", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const text = doc.getText();

        if (["vue", "html"].includes(doc.languageId)) {
            await handleVueHtml(editor, text, doc);
        } else if (["javascriptreact", "typescriptreact"].includes(doc.languageId)) {
            if (text.includes("StyleSheet.create")) {
                await handleReactNative(editor, text, doc);
            } else {
                await handleReactWeb(editor, text, doc);
            }
        } else {
            vscode.window.showInformationMessage("Works only in Vue, HTML, React Native, or React Web files.");
        }
    });

    context.subscriptions.push(disposable);

    // 🔥 Watch new .tsx/.jsx files and auto-create filename.module.css
    const watcher = vscode.workspace.onDidCreateFiles(async (event) => {
        for (const file of event.files) {
            if (file.fsPath.endsWith(".tsx") || file.fsPath.endsWith(".jsx")) {
                const cssPath = file.fsPath.replace(/\.(tsx|jsx)$/, ".module.css");
                const cssUri = vscode.Uri.file(cssPath);
                try {
                    await vscode.workspace.fs.stat(cssUri); // already exists
                } catch {
                    await vscode.workspace.fs.writeFile(cssUri, Buffer.from("", "utf8"));
                    vscode.window.showInformationMessage(`Created ${cssUri.fsPath}`);
                }
            }
        }
    });

    context.subscriptions.push(watcher);
}

export function deactivate() {}
