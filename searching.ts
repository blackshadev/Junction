﻿import { SortedArray, IValueOf} from "./collections";


class State implements IValueOf {
    // Path of states to this state
    path: State[];
    left: State[];
    cost: number;

    // user definable data
    data: any;

    constructor(data: any) {
        this.data = data;
        this.path = [];
        this.left = []; 
    }


    valueOf() : number {
        return this.cost;
    }
}

abstract class GreedySearch<S extends State> {

    /**
     * Returns possible moves from given state
     * @param state State to inspect to move from
     */
    protected abstract move(state): S[];

    /**
     * Whenever a given state is a goal state
     * @param state State to inspect
     */
    protected abstract goal(state) : boolean;

    /**
     * Return the initial states
     */
    protected abstract initial(): S[];

    /**
     * Calculates the cost of a state
     */
    protected cost(state: S) { return state.path.length; }
    

    next(): S {
        let nodes = new SortedArray<S>(this.initial());

        while (nodes.length > 0) {
            let state = nodes.items.shift();

            // Is goal state?
            if (this.goal(state)) return state;

            let arr = this.move(state);
            arr.forEach((e) => { e.cost = this.cost(e); });

            // Add the new states to our possible moves
            nodes.addAll(arr);
        }

        // no more states
        return;
    }
}