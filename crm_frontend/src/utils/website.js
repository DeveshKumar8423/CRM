export const PAGE_TYPE_LABELS = {
  landing: "Landing page",
  service: "Service page",
  general: "General page",
};

export const STATUS_LABELS = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const SECTION_LABELS = {
  hero: "Hero",
  rich_text: "Text block",
  image: "Image",
  services_grid: "Services grid",
  testimonials: "Testimonials",
  faq: "FAQ",
  cta_banner: "Call to action",
  form_embed: "Form",
  contact_info: "Contact info",
  spacer: "Spacer",
};

export function statusBadgeClass(status) {
  if (status === "published") return "crm-badge crm-badge-success";
  if (status === "archived") return "crm-badge crm-badge-muted";
  return "crm-badge crm-badge-warning";
}

export function emptyPageForm() {
  return {
    title: "",
    slug: "",
    page_type: "general",
    seo_title: "",
    seo_description: "",
    sections_json: [],
    product_id: null,
    is_home: false,
  };
}

export function emptyFormBuilder() {
  return {
    name: "",
    slug: "",
    fields_json: [],
    success_message: "Thank you! We will contact you shortly.",
    redirect_url: "",
    is_active: true,
  };
}

export function emptyBlogForm() {
  return {
    title: "",
    slug: "",
    excerpt: "",
    body_html: "",
    cover_image_url: "",
    seo_title: "",
    seo_description: "",
    tags: [],
  };
}

export function defaultSection(type) {
  const base = { id: crypto.randomUUID(), type, props: {} };
  switch (type) {
    case "hero":
      return {
        ...base,
        props: {
          headline: "Your headline",
          subheadline: "Supporting line",
          image_url: "",
          cta_label: "Get started",
          cta_link: "",
        },
      };
    case "rich_text":
      return { ...base, props: { title: "", body: "<p>Your content here</p>" } };
    case "image":
      return { ...base, props: { image_url: "", alt_text: "", caption: "" } };
    case "services_grid":
      return { ...base, props: { title: "Our services", source: "products", limit: 3 } };
    case "testimonials":
      return {
        ...base,
        props: {
          title: "What clients say",
          items: [{ quote: "Great service!", name: "Client name", role: "CEO", avatar_url: "" }],
        },
      };
    case "faq":
      return {
        ...base,
        props: {
          title: "FAQ",
          items: [{ question: "How does it work?", answer: "We guide you end to end." }],
        },
      };
    case "cta_banner":
      return {
        ...base,
        props: { headline: "Ready to start?", button_label: "Contact us", link: "" },
      };
    case "form_embed":
      return { ...base, props: { form_id: null } };
    case "contact_info":
      return { ...base, props: {} };
    case "spacer":
      return { ...base, props: { size: "md" } };
    default:
      return base;
  }
}
