const injectPrintStyles = (() => {
  if (!global.document) {
    return;
  }
  const style = document.createElement("style");
  document.head.append(style);
  return (styleString: string) => (style.textContent = styleString);
})();

export function injectStandardPrintStyles() {
  injectPrintStyles?.(`
  @media print {
    @page {
      size: 3508px 2480px;
      color-adjust: exact;
    }
    body,
    html {
      width: 3508px;
      height: 2480px;
    }
  }
  @media print {
    body {
      print-color-adjust: exact;
    }
  }
`);
}

export function injectA3PrintStyles() {
  injectPrintStyles?.(`
  @media print {
    @page {
      size: 3508px 5127px;
      color-adjust: exact;
      margin: 0;
    }
    body,
    html {
      width: 3508px;
      height: 5127px;
    }
  }
  @media print {
    body {
      print-color-adjust: exact;
    }
  }
`);
}
