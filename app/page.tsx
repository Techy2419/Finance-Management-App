import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WalletCards } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <WalletCards className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Take Control of Your Finances
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Track expenses, manage budgets, and achieve your financial goals with our comprehensive finance management platform.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Create Account</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Expense Tracking</h3>
              <p className="text-muted-foreground">Monitor your spending habits with detailed transaction tracking and categorization.</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Budget Management</h3>
              <p className="text-muted-foreground">Set and track budgets for different categories to stay on top of your financial goals.</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Financial Insights</h3>
              <p className="text-muted-foreground">Get detailed reports and visualizations to understand your financial patterns.</p>
            </Card>
          </div>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}