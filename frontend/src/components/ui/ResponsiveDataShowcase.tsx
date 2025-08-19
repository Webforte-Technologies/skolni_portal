import React, { ReactNode } from 'react';
import { ResponsiveTable, TableColumn } from './ResponsiveTable';
import { ResponsiveDataGrid } from './ResponsiveDataGrid';
import { ResponsiveChart } from './ResponsiveChart';
import { ResponsiveDataDisplay } from './ResponsiveDataDisplay';
import Card from './Card';

// Sample data types
interface Student {
  id: string;
  name: string;
  email: string;
  credits: number;
  lastActive: string;
  status: 'active' | 'inactive';
  grade: number;
}

interface CreditUsage {
  month: string;
  credits: number;
  users: number;
}

export const ResponsiveDataShowcase: React.FC = () => {
  // Sample student data
  const students: Student[] = [
    {
      id: '1',
      name: 'Jan Novák',
      email: 'jan.novak@skola.cz',
      credits: 150,
      lastActive: '2024-01-15',
      status: 'active',
      grade: 85,
    },
    {
      id: '2',
      name: 'Marie Svobodová',
      email: 'marie.svobodova@skola.cz',
      credits: 75,
      lastActive: '2024-01-14',
      status: 'active',
      grade: 92,
    },
    {
      id: '3',
      name: 'Petr Dvořák',
      email: 'petr.dvorak@skola.cz',
      credits: 0,
      lastActive: '2024-01-10',
      status: 'inactive',
      grade: 78,
    },
    {
      id: '4',
      name: 'Anna Procházková',
      email: 'anna.prochazka@skola.cz',
      credits: 200,
      lastActive: '2024-01-16',
      status: 'active',
      grade: 96,
    },
  ];

  // Sample credit usage data
  const creditUsage: CreditUsage[] = [
    { month: 'Leden', credits: 1250, users: 45 },
    { month: 'Únor', credits: 1580, users: 52 },
    { month: 'Březen', credits: 1320, users: 48 },
    { month: 'Duben', credits: 1750, users: 58 },
    { month: 'Květen', credits: 1420, users: 51 },
  ];

  // Table columns for students
  const studentColumns: TableColumn<Student>[] = [
    {
      key: 'name',
      header: 'Jméno',
      accessor: 'name',
      mobileLabel: 'Student',
    },
    {
      key: 'email',
      header: 'Email',
      accessor: 'email',
      mobileHidden: true,
      className: 'text-gray-600 dark:text-neutral-400',
    },
    {
      key: 'credits',
      header: 'Kredity',
      accessor: (student) => (
        <span className={`font-semibold ${
          student.credits > 100 ? 'text-green-600' : 
          student.credits > 0 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {student.credits}
        </span>
      ),
    },
    {
      key: 'grade',
      header: 'Známka',
      accessor: (student) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          student.grade >= 90 ? 'bg-green-100 text-green-800' :
          student.grade >= 80 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {student.grade}%
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Stav',
      accessor: (student) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          student.status === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {student.status === 'active' ? 'Aktivní' : 'Neaktivní'}
        </span>
      ),
      mobileOrder: 1,
    },
    {
      key: 'lastActive',
      header: 'Poslední aktivita',
      accessor: 'lastActive',
      mobileHidden: true,
      className: 'text-sm text-gray-500 dark:text-neutral-400',
    },
  ];

  // Chart data for credit usage
  const chartData = creditUsage.map(item => ({
    label: item.month,
    value: item.credits,
  }));

  const userChartData = creditUsage.map(item => ({
    label: item.month,
    value: item.users,
  }));

  return (
    <div className="space-y-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
          Responsive Data Display Components
        </h1>
        <p className="text-gray-600 dark:text-neutral-400">
          Ukázka responzivních komponent pro zobrazení dat
        </p>
      </div>

      {/* Comprehensive Data Display */}
      <Card title="Kompletní datový displej" className="mb-8">
        <ResponsiveDataDisplay
          data={students}
          columns={studentColumns}
          title="Seznam studentů"
          allowedModes={['table', 'cards', 'grid', 'chart']}
          defaultMode="table"
          chartConfig={{
            type: 'bar',
            valueKey: 'credits',
            labelKey: 'name',
            title: 'Kredity studentů',
          }}
          tableProps={{
            emptyMessage: 'Žádní studenti nebyli nalezeni',
            onRowClick: (student) => alert(`Kliknuto na: ${student.name}`),
          }}
          gridProps={{
            mobileLayout: 'cards',
            tabletLayout: 'cards',
            desktopLayout: 'grid',
            gridColumns: { mobile: 1, tablet: 2, desktop: 3 },
          }}
          actions={
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Přidat studenta
            </button>
          }
        />
      </Card>

      {/* Responsive Table */}
      <Card title="Responzivní tabulka" className="mb-8">
        <ResponsiveTable
          data={students}
          columns={studentColumns}
          onRowClick={(student) => alert(`Vybrán student: ${student.name}`)}
          mobileCardView={true}
          mobileStackedView={true}
        />
      </Card>

      {/* Responsive Data Grid */}
      <Card title="Responzivní datová mřížka" className="mb-8">
        <ResponsiveDataGrid
          data={students.map(s => ({ ...s }))}
          columns={studentColumns.map(col => ({
            key: col.key,
            label: col.header,
            render: typeof col.accessor === 'function' ? 
              (_value, item) => (col.accessor as (item: Student) => ReactNode)(item as Student) : 
              (value) => value,
            mobileHidden: col.mobileHidden,
          }))}
          mobileLayout="cards"
          tabletLayout="cards"
          desktopLayout="grid"
          gridColumns={{ mobile: 1, tablet: 2, desktop: 3 }}
          onItemClick={(item) => alert(`Vybrán: ${item.name}`)}
        />
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Použití kreditů (sloupcový graf)">
          <ResponsiveChart
            data={chartData}
            type="bar"
            title="Měsíční spotřeba kreditů"
            showLegend={false}
            showValues={true}
          />
        </Card>

        <Card title="Počet uživatelů (čárový graf)">
          <ResponsiveChart
            data={userChartData}
            type="line"
            title="Aktivní uživatelé"
            showLegend={false}
            showValues={true}
          />
        </Card>

        <Card title="Distribuce kreditů (koláčový graf)">
          <ResponsiveChart
            data={chartData}
            type="pie"
            title="Rozdělení kreditů podle měsíců"
            showLegend={true}
            showValues={true}
          />
        </Card>

        <Card title="Aktivita uživatelů (prstencový graf)">
          <ResponsiveChart
            data={userChartData}
            type="doughnut"
            title="Měsíční aktivita"
            showLegend={true}
            showValues={false}
          />
        </Card>
      </div>

      {/* Mobile-specific examples */}
      <Card title="Mobilní optimalizace" className="mb-8">
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              📱 Mobilní funkce
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Automatické přepínání na kartové zobrazení</li>
              <li>• Horizontální scrollování pro široké tabulky</li>
              <li>• Responzivní velikosti grafů</li>
              <li>• Touch-friendly ovládací prvky</li>
              <li>• Kompaktní legendy a popisky</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
              💻 Desktopové funkce
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
              <li>• Plné tabulkové zobrazení</li>
              <li>• Větší grafy s detailními popisky</li>
              <li>• Hover efekty a tooltips</li>
              <li>• Více sloupců v mřížkovém zobrazení</li>
              <li>• Rozšířené legendy</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};