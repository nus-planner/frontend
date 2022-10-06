import { Box } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ModuleBoxProps = {
  id: number;
};

const ModuleBox = ({ id }: ModuleBoxProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Box
        w="50px"
        h="50px"
        bgColor="green.300"
        alignContent="center"
        margin="3"
      >
        {id}
      </Box>
    </div>
  );
};

export default ModuleBox;
