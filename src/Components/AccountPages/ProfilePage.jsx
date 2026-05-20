/* eslint-disable react/prop-types */
import { renderAvatar } from "./accountUtils";

function ProfilePage({ user }) {
  const stats = user.stats || {};

  return (
    <>
      {renderAvatar(user)}
      <div className="detail-list profile-detail-grid" aria-label="User details">
        <div>
          <span>Username</span>
          <strong>@{user.username}</strong>
        </div>
        <div>
          <span>Name</span>
          <strong>{user.name}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div>
          <span>Questions Solved</span>
          <strong>{stats.totalSolved || 0}</strong>
        </div>
        <div>
          <span>Correct Answers</span>
          <strong>{stats.totalCorrect || 0}</strong>
        </div>
        <div>
          <span>Completed Quizzes</span>
          <strong>{stats.completedQuizzes || 0}</strong>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
