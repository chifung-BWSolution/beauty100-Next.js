import type { Meta, StoryObj } from "@storybook/react";
import MerchantCTABanner from "@/components/MerchantCTABanner";

const meta: Meta<typeof MerchantCTABanner> = {
  title: "Components/MerchantCTABanner",
  component: MerchantCTABanner,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    title: {
      control: { type: "text" },
      description: "Main heading text displayed at the top of the banner",
    },
    subtitle: {
      control: { type: "text" },
      description: "Secondary heading text displayed below the main title",
    },
    description: {
      control: { type: "text" },
      description: "Body paragraph text providing details about the CTA",
    },
    ctaLabel: {
      control: { type: "text" },
      description: "Label text displayed inside the CTA button",
    },
    ctaHref: {
      control: { type: "text" },
      description: "URL the CTA button links to",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MerchantCTABanner>;

/**
 * The default MerchantCTABanner as used in the merchant page.
 * Renders with all built-in default values — a dark gradient background,
 * decorative blurred circles, a two-line Chinese heading, a descriptive
 * paragraph, and a pill-shaped CTA button with an arrow icon.
 */
export const Default: Story = {
  args: {
    title: "立即註冊",
    subtitle: "創造營商契機",
    description:
      "立即註冊成為 Beauty100 用戶會員，解鎖專屬資源及專業支援，讓您的美容業務在香港市場中佔據優勢。通過數據洞察、創意推廣及合作機會，我們助您把握美容業趨勢，實現高效增長與可持續成功。探索更多核心服務，或透過聯繫我們頁面獲取即時協助！",
    ctaLabel: "立即體驗",
    ctaHref: "/login",
  },
};

/**
 * Demonstrates the banner with fully customised text and CTA link,
 * showing how it can be repurposed for different promotional contexts
 * beyond the default merchant registration flow.
 */
export const CustomContent: Story = {
  args: {
    title: "Join Our Network",
    subtitle: "Grow Your Business",
    description:
      "Partner with Beauty100 to reach thousands of beauty enthusiasts across Hong Kong. Access exclusive marketing tools, analytics dashboards, and a dedicated support team to help your salon thrive in a competitive market.",
    ctaLabel: "Get Started",
    ctaHref: "/register",
  },
};
