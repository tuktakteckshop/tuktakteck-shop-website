import React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export default function Link({ to, children, ...props }: LinkProps) {
  // Normalize path. E.g. "/shop" or "shop" -> "#/shop"
  let path = to;
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  const href = `#/${path}`;

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
