import { useNavigate } from 'react-router-dom';
function Help() {
    const navigate = useNavigate();
    return(
        <div className="help-page">
            <button className="back-button" onClick={() => navigate('/Dashboard')}>
                Back to Dashboard
            </button>
            <header className="help-header">
                <h1>Help Page</h1>
                <p>
                    Welcome to the help page
                </p>
            </header>
            <main className="help-content">
                <section className="help-section">
                    <h2>Navigation</h2>
                    <p>Update this when site navigation is finalized</p>
                    <p>lowkey we should add screenshots alongside the navigation stuff </p>
                    <h3>FAQ</h3>
                    <p>What is Apptrition designed to help me do?</p>
                    <p>Our app is here to help you organize your meals, descover new recipies, and simplify your cooking experience. 
                        Our goal is to provide you with a meal prep app specific to your goals, not just counting calories. Here you can 
                        discover new recipies, plan meals, make shopping lists, and keep everything organized in one place.</p>
                    <p>How can I find new recipies?</p>
                    <p>In the main welcome page, clicking on the "Discover Recipies!" will pring you to our search page where you can 
                        search for recipies based on ingredients or name.</p>
                    <p>How can I change my account preferences?</p>
                    <p>In the welcome page you will see a button at the top of the screen labeled 'Profile'. Clicking that button 
                        will bring you to a page to update your personal preferences</p>
                </section>
            </main>
        </div>
    );
}

export default Help;