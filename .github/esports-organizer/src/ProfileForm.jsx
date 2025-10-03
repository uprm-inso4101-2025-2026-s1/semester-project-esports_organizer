import { useState } from 'react';

function ProfileForm() {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userBio, setUserBio] = useState('');
    const [userPhotoUrl, setUserPhotoUrl] = useState('');
    const [userRole, setUserRole] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Perfil enviado:', { userName, userEmail, userBio, userPhotoUrl, userRole});
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px'}}
        >
            <h2>Create Profile</h2>

            <label>
                Name: <input
                type='text'
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="What's your name?"
                required
                />
            </label>    

            <label>
                Email:
                <input
                type="email"
                value={userEmail}
                onChange={(event) => setUserEmail(event.target.value)}
                placeholder="ejemplo@correo.com"
                required
                />
            </label>

            <label>
                Bio:
                <textarea
                value={userBio}
                onChange={(event) => setUserBio(event.target.value)}
                placeholder="Tell us about you"
                rows="4"/>
            </label>

            <label>
                Foto (URL):
                <input
                type="url"
                value={userPhotoUrl}
                onChange={(event) => setUserPhotoUrl(event.target.value)}
                placeholder="https://..."
                />
            </label>

            <label>
                Rol:
                <select
                value={userRole}
                nChange={(event) => setUserRole(event.target.value)}
                required
                >
                <option value="">Select a rol</option>
                <option value="player">Player</option>
                <option value="organizer">Organizer</option>
                <option value="coach">Coach</option>
                </select>
            </label>

            <button type="submit">Save</button>
        </form>
    );
}

export default ProfileForm;