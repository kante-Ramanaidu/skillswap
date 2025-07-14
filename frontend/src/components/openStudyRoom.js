// ✅ openStudyRoom.js
export function openStudyRoom({ currentUserId, partnerId, partnerName = '', skillsToTeach = [], skillsToLearn = [] }) {
  const roomId = [currentUserId, partnerId].sort().join('_');

  localStorage.setItem('partnerId', partnerId);
  localStorage.setItem('partnerName', partnerName);
  localStorage.setItem('partnerPhone', '');
  localStorage.setItem('skillsToTeach', JSON.stringify(skillsToTeach));
  localStorage.setItem('skillsToLearn', JSON.stringify(skillsToLearn));

  return `/study/${roomId}`;
}
