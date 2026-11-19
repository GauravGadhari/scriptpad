import { Mark, mergeAttributes } from "@tiptap/core";

export interface ScriptLabelAttributes {
  id?: string;
  name?: string;
  color?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    scriptLabel: {
      setScriptLabel: (attrs: ScriptLabelAttributes) => ReturnType;
      unsetScriptLabel: (id?: string) => ReturnType;
    };
  }
}

export const ScriptLabelMark = Mark.create({
  name: "scriptLabel",

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return {
            "data-label-id": attributes.id,
          };
        },
      },
      name: {
        default: "Hook",
        parseHTML: (element) => element.getAttribute("data-label-name"),
        renderHTML: (attributes) => {
          if (!attributes.name) return {};
          return {
            "data-label-name": attributes.name,
          };
        },
      },
      color: {
        default: "#0066cc",
        parseHTML: (element) => element.getAttribute("data-label-color"),
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            "data-label-color": attributes.color,
            "--label-tint": attributes.color + "22",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-label-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "script-annotated-label",
        style: `--label-color: ${HTMLAttributes["data-label-color"] || "#0066cc"};`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setScriptLabel:
        (attrs) =>
        ({ commands }) => {
          return commands.setMark(this.name, attrs);
        },
      unsetScriptLabel:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
