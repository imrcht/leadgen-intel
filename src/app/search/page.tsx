import AppShell from '@/components/layout/AppShell';
import SearchForm from '@/components/search/SearchForm';

export default function SearchPage() {
  return (
    <AppShell>
      <div className="py-8">
        <SearchForm />
      </div>
    </AppShell>
  );
}
