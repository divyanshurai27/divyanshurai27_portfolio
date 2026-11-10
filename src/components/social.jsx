import { Code2, Github, Linkedin, MessageCircle } from "lucide-react";
import { site } from "../config/site.js";

// Only links that are filled in on the config are rendered.
export function socialLinks() {
  const c = site.contact;
  return [
    { label: "LinkedIn", href: c.linkedin, Icon: Linkedin },
    { label: "GitHub", href: c.github, Icon: Github },
    { label: "LeetCode", href: c.leetcode, Icon: Code2 },
    {
      label: "WhatsApp",
      href: c.whatsapp && `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(`Hi ${site.identity.firstName}, I saw your portfolio.`)}`,
      Icon: MessageCircle,
    },
  ].filter((l) => l.href);
}
