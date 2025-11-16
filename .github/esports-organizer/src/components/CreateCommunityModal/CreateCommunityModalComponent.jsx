import { useState } from "react";
import "./CreateCommunityModalComponent.css"

function CreateCommunityModalComponent({ onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [game, setGame] = useState("");
    const [location, setLocation] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !game) {
            alert("Community Name and Game are required.");
            return;
        }
        setIsSubmitting(true);

        const communityData = {
            name,
            description,
            game,
            location,
            iconUrl,
            bannerUrl
        };

    //     Here is where we push the new community data into the backend.
        console.log("Submitting new community to database...", communityData)
        onSubmit(communityData);

        // close modal after submitting communityData
    };

    const handleBackgroundClick = (e) => {
        if (e.target == e.currentTarget) {
            onClose();
        }
    };

    return  (

        <div className="modal-background" onClick={handleBackgroundClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create a Community</h2>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close"> &times; </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                {/*    community section of the form*/}
                    <div className="form-group">
                        <label htmlFor="communityName">Community Name</label>
                        <input id="communityName"
                               type="text"
                               value={name}
                               onChange={(e)=> setName(e.target.value)}
                               placeholder="e.g., Marvel Rivals Champions"
                               required
                        />
                    </div>
                {/*    primary game section of the form*/}
                    <div className="form-group">
                        <label htmlFor="communityGame">Primary Game</label>
                        <input id="communityGame"
                               type="text"
                               value={game}
                               onChange={(e)=> setGame(e.target.value)}
                               placeholder="e.g., Marvel Rivals"
                               required
                        />
                    </div>
                {/*    location section of the form*/}
                    <div className="form-group">
                        <label htmlFor="communityLocation">Location</label>
                        <input id="communityLocation"
                               type="text"
                               value={location}
                               onChange={(e)=> setLocation(e.target.value)}
                               placeholder="e.g., North America"
                        />
                    </div>
                    {/*description section of the form*/}
                    <div className="form-group">
                        <label htmlFor="communityDescription">Description</label>
                        <input id="communityDescription"
                               value={description}
                               onChange={(e)=> setDescription(e.target.value)}
                               placeholder="Tell the community what your place is about..."
                               rows={3}
                        />
                    </div>
                {/*    icon section of the form*/}
                    <div className="form-group">
                        <label htmlFor="communityIcon">Icon URL (Optional</label>
                        <input id="communityIcon"
                               type="text"
                               value={iconUrl}
                               onChange={(e)=> setIconUrl(e.target.value)}
                               placeholder="https://.../my_icon.png"
                        />
                    </div>
                {/*    banner section of the form*/}
                    <div className="form-group">
                        <label htmlFor="communityBanner">Banner URL (optional)</label>
                        <input id="communityBanner"
                               type="text"
                               value={bannerUrl}
                               onChange={(e)=> setBannerUrl(e.target.value)}
                               placeholder="https://.../my_banner.jpg"
                        />
                    </div>
                {/*    actions section of the form*/}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-btn cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                            >Cancel</button>
                        <button
                            type="submit"
                            className="modal-btn create"
                            disabled={isSubmitting || !name || !game}
                            > {isSubmitting ? "Creating..." : "Create"}</button>
                    </div>
                </form>
            </div>
        </div>
    ); // main function return
}

export default CreateCommunityModalComponent;