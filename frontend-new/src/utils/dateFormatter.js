export const formatTimestamp = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();

    // Check if valid date
    if (isNaN(date.getTime())) return '-';

    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    }

    return date.toLocaleString();
};
