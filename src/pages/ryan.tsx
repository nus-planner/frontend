import { Grid, GridItem } from "@chakra-ui/react";
import { DndContext, closestCenter, useDroppable } from "@dnd-kit/core";
import ModuleBox from "../components/ModuleBox";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

const RyanTestPage = () => {
  const { setNodeRef } = useDroppable({
    id: 1,
  });

  const handleDragEnd = (event) => {
    console.log("drag end called");
    const { active, over } = event;

    console.log("active: " + active.id);
    console.log("over: " + over.id);

    if (active.id !== over.id) {
      //console.log(arrayMove(items, activeIndex, overIndex));
      setItems((items) => {
        return arrayMove(
          items,
          items.indexOf(active.id),
          items.indexOf(over.id)
        );
      });
    }
  };

  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <a>Testing random junk</a>
      <GridItem w="100%" h="300" boxShadow="outline" m="10">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div>
            {items.map((id) => (
              <ModuleBox id={id} key={id}>
                {" "}
              </ModuleBox>
            ))}
          </div>
        </SortableContext>
      </GridItem>
    </DndContext>
  );
};

export default RyanTestPage;

// const handleDragEnd = (event) => {
//   const { active, over } = event;
//   const { id } = active;
//   const { id: overId } = over;

//   const activeContainer = findContainer(id);
//   const overContainer = findContainer(overId);

//   if (
//     !activeContainer ||
//     !overContainer ||
//     activeContainer !== overContainer
//   ) {
//     return;
//   }

//   const activeIndex = items[activeContainer].indexOf(active.id);
//   const overIndex = items[overContainer].indexOf(overId);

//   if (activeIndex !== overIndex) {
//     setItems((items) => ({
//       ...items,
//       [overContainer]: arrayMove(
//         items[overContainer],
//         activeIndex,
//         overIndex
//       ),
//     }));
//   }

//   setActiveId(null);
// }
