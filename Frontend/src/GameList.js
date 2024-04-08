import {React} from "react";

function GameList({session, styles}) {

    const handleSubmit = async evt => {
        evt.preventDefault();
    };

    return (
        <div className={styles.gameArea}>
            <h4 style={{width:"100%"}}>Games In Common</h4>
            {session.games.map((game, i) => {return (
                <button className={styles.gameCard} key={i}>
                    <img src={game.img_url}/>
                    <br/>
                    {game.name}
                </button>);
            })}
        </div>
    );
}

export default GameList;