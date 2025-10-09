const StatusBadge = ({ status, type = "default" }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case "annotated":
      case "completed":
      case "accepted":
        return "bg-green-100 text-green-800";
      case "not annotated":
      case "pending":
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
