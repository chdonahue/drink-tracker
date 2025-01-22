const TabGroup = ({ activeTab, onTabChange }) => {
    const tabs = [
      { id: 'weekly', label: 'Weekly Stats' },
      { id: 'monthly', label: 'Monthly Stats' },
    ];
  
    return (
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8" aria-label="Stats navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  export default TabGroup;