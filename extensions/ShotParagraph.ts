import Paragraph from "@tiptap/extension-paragraph";

export interface ShotAttributes {
  shotType?: string | null;
  shotColor?: string | null;
  shotLabel?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    shotBlock: {
      setShotType: (attrs: ShotAttributes) => ReturnType;
      unsetShotType: () => ReturnType;
    };
  }
}

export const ShotParagraph = Paragraph.extend({
  name: "paragraph",

  addAttributes() {
    return {
      ...this.parent?.(),
      shotType: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-shot-type"),
        renderHTML: (attributes) => {
          if (!attributes.shotType) return {};
          return {
            "data-shot-type": attributes.shotType,
          };
        },
      },
      shotColor: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-shot-color"),
        renderHTML: (attributes) => {
          if (!attributes.shotColor) return {};
          return {
            "data-shot-color": attributes.shotColor,
            style: `background-color: ${attributes.shotColor};`,
          };
        },
      },
      shotLabel: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-shot-label"),
        renderHTML: (attributes) => {
          if (!attributes.shotLabel) return {};
          return {
            "data-shot-label": attributes.shotLabel,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      setShotType:
        (attrs: ShotAttributes) =>
        ({ commands }) => {
          return commands.updateAttributes("paragraph", attrs);
        },
      unsetShotType:
        () =>
        ({ commands }) => {
          return commands.updateAttributes("paragraph", {
            shotType: null,
            shotColor: null,
            shotLabel: null,
          });
        },
    };
  },
});
