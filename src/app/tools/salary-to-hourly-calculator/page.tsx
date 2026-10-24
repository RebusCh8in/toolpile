import { redirect } from "next/navigation";

export const metadata = {
  title: "Salary to Hourly Calculator",
  alternates: { canonical: "https://toolpile.app/tools/hourly-to-salary-calculator" },
};

export default function SalaryToHourlyRedirect() {
  redirect("/tools/hourly-to-salary-calculator");
}
