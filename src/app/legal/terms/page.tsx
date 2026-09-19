import React from 'react';
import { FileText, ShoppingCart, AlertCircle, Scale, CreditCard, Users } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Legal</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Terms &amp; Conditions</h1>
        <p className="text-slate-500">Last updated: September 2026 | By using this website, you agree to these terms</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">Please read these Terms carefully before using our platform. By accessing or placing an order on HealorHealthcare, you confirm that you are at least 18 years of age and agree to be bound by these Terms.</p>
      </div>

      <div className="space-y-8">
        {[{
          icon: Users,
          title: '1. User Eligibility & Registration',
          content: `You must be at least 18 years old to create an account and place orders on HealorHealthcare. By registering, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials. HealorHealthcare reserves the right to suspend or terminate accounts found to be involved in fraudulent or unlawful activity. One account per individual is permitted; creating multiple accounts to abuse promotions is prohibited.`
        }, {
          icon: ShoppingCart,
          title: '2. Product Information & Availability',
          content: `We make every effort to display accurate product descriptions, prices, and availability. However, we do not warrant that descriptions, prices, or other content are accurate, complete, or error-free. Product availability is subject to change without prior notice. We reserve the right to limit quantities per order. In case of pricing errors, we will notify you and give you the option to proceed at the corrected price or cancel the order.`
        }, {
          icon: CreditCard,
          title: '3. Pricing & Payment',
          content: `All prices are listed in Indian Rupees (INR) inclusive of applicable taxes. Prices may change without notice but will be honoured for orders already placed. We accept UPI, Net Banking, Credit/Debit Cards, and Cash on Delivery. Payments are processed securely by Razorpay. In case of payment failure, no amount will be debited. If an amount is debited but the order is not placed, the refund will be processed within 5–7 business days automatically.`
        }, {
          icon: AlertCircle,
          title: '4. Prohibited Uses',
          content: `You may not use our platform for: (a) Any unlawful purpose. (b) Placing fraudulent orders or providing false information. (c) Attempting to gain unauthorised access to any part of our systems. (d) Scraping, crawling, or extracting data without written permission. (e) Circumventing security measures. (f) Impersonating another person or entity. Violation of these terms may result in immediate account termination and legal action.`
        }, {
          icon: Scale,
          title: '5. Limitation of Liability',
          content: `To the maximum extent permitted by law, HealorHealthcare shall not be liable for: indirect, incidental, or consequential damages arising from use of our service; any loss of profits, data, or business opportunity; health outcomes resulting from the use or misuse of purchased products; delays beyond our reasonable control (force majeure events including natural disasters, government actions, etc.). Our total liability shall not exceed the amount paid for the specific order giving rise to the claim.`
        }, {
          icon: FileText,
          title: '6. Intellectual Property',
          content: `All content on this website, including logos, product descriptions, images, and software, is the intellectual property of HealorHealthcare or its licensors. You may not reproduce, distribute, or create derivative works without our express written consent. Feedback, reviews, or content submitted by users grants HealorHealthcare a non-exclusive, royalty-free, perpetual license to use such content for business purposes.`
        }, {
          icon: Scale,
          title: '7. Governing Law & Dispute Resolution',
          content: `These Terms are governed by the laws of India. Any disputes arising out of these Terms or your use of the platform shall first be attempted to be resolved amicably through our customer support team. If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra. For consumer disputes, you may also approach the Consumer Disputes Redressal Forum under the Consumer Protection Act, 2019.`
        }].map((section) => (
          <div key={section.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="w-5 h-5 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-slate-900 text-slate-300 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-2">Questions about these Terms?</h3>
        <p className="text-sm">Contact us at <span className="text-teal-400">supporthealorahealthcare@gmail.com</span></p>
        <p className="text-xs text-slate-500 mt-2">We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
      </div>
    </div>
  );
}