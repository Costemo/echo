import { useParams } from 'react-router-dom';

const Group = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Group Page for {id}</h1>
        </div>
    )
}

export default Group;