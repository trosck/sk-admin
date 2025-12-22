import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import LinkIcon from "@mui/icons-material/Link";
import MDEditor, { commands, type ICommand } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

interface RichTextEditorFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
  error?: boolean | string | { message?: string } | undefined;
  translate: (key: string) => string;
}

export const RichTextEditorField: React.FC<RichTextEditorFieldProps> = ({
  value,
  onChange,
  error,
  translate,
}) => {
  const [markdownValue, setMarkdownValue] = useState<string>(value ?? "");

  // Синхронизируем с внешним value
  useEffect(() => {
    setMarkdownValue(value ?? "");
  }, [value]);

  const handleChange = (val?: string) => {
    const newMarkdown = val ?? "";
    setMarkdownValue(newMarkdown);
    onChange(newMarkdown);
  };

  const handleInsertLink = (href: string, text: string, state?: any) => {
    const linkMarkdown = `[${text}](${href})`;
    const currentValue = markdownValue || "";

    // Если есть выделенный текст, заменяем его на ссылку
    // Иначе вставляем ссылку в текущую позицию или в конец
    let newValue: string;
    if (state?.selectedText) {
      // Заменяем выделенный текст на ссылку
      const before = currentValue.substring(0, state.selectionStart || 0);
      const after = currentValue.substring(
        state.selectionEnd || currentValue.length
      );
      newValue = before + linkMarkdown + " " + after;
    } else {
      // Вставляем ссылку в конец
      newValue = currentValue + (currentValue ? " " : "") + linkMarkdown + " ";
    }

    setMarkdownValue(newValue);
    onChange(newValue);
  };

  // Кастомные команды с кнопкой для вставки ссылок
  const editorCommands: ICommand[] = [
    commands.bold,
    commands.italic,
    commands.link,
  ];

  return (
    <div>
      <div data-color-mode="dark">
        <MDEditor
          value={markdownValue}
          onChange={handleChange}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
          commands={editorCommands}
          extraCommands={[]}
        />
      </div>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
          {typeof error === "string"
            ? error
            : typeof error === "object" && error?.message
            ? error.message
            : translate("errors.required.field")}
        </Typography>
      )}
    </div>
  );
};
