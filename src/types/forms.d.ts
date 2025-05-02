
// Form event types
interface ExtendedHTMLInputElement extends HTMLInputElement {
  checked?: boolean;
}

interface ExtendedEvent extends React.ChangeEvent<HTMLInputElement | HTMLSelectElement> {
  target: ExtendedHTMLInputElement | HTMLSelectElement;
}
