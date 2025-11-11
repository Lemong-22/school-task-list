export const TaskSkeleton = () => (
  <div className="animate-pulse bg-component-dark rounded-lg p-6 border border-border-dark">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="h-8 w-20 bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-700 rounded w-full"></div>
      <div className="h-3 bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="animate-pulse bg-component-dark rounded-lg p-6 shadow-md">
    <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
    <div className="h-8 bg-gray-700 rounded w-1/3"></div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-700 rounded w-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-700 rounded w-16"></div>
    </td>
  </tr>
);

export const LeaderboardSkeleton = () => (
  <div className="animate-pulse bg-component-dark rounded-lg p-4 border border-border-dark">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="h-6 w-16 bg-gray-700 rounded"></div>
    </div>
  </div>
);

export const ShopItemSkeleton = () => (
  <div className="animate-pulse bg-component-dark rounded-lg p-6 border border-border-dark">
    <div className="flex items-center justify-center mb-4">
      <div className="h-16 w-16 bg-gray-700 rounded-full"></div>
    </div>
    <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
    <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-3 bg-gray-700 rounded w-5/6 mb-4"></div>
    <div className="h-10 bg-gray-700 rounded w-full"></div>
  </div>
);
