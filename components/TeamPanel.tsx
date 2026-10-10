type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
};

export default function TeamPanel({ teamMembers }: { teamMembers: TeamMember[] }) {
  return (
    <div className="panel-page">
      <div className="section-heading">
        <p className="eyebrow">Team workspace</p>
        <h2>Shared prompts and collaboration</h2>
      </div>

      <div className="team-grid">
        <div className="info-card">
          <h3>Current workspace</h3>
          <div className="workspace-pill">Prompt Studio Team</div>
          <ul className="metric-list">
            <li><strong>Members:</strong> {teamMembers.length}</li>
            <li><strong>Shared prompts:</strong> 48</li>
            <li><strong>Active editors:</strong> 3</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Invite members</h3>
          <div className="invite-box">
            <input type="email" placeholder="team@company.com" className="form-input" />
            <button className="btn btn-primary">Send invite</button>
          </div>
        </div>
      </div>

      <div className="member-list">
        {teamMembers.map((member) => (
          <div key={member.id} className="member-row">
            <div className="member-avatar">{member.name.charAt(0)}</div>
            <div>
              <strong>{member.name}</strong>
              <p>{member.email}</p>
            </div>
            <span className="role-badge">{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
