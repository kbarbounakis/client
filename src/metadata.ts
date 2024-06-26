import { XDocument, XNode, XSerializer } from '@themost/xml';

export declare type EntityConstructor<T> = new(...args: any[]) => T;

export declare interface EntityTypeAnnotation {
    Entity: {
        name?: string
    }
}

export declare interface EntitySetAnnotation {
    EntitySet: {
        name?: string
    }
}

/**
 * Represents an OData service metadata document
 */
export class EdmSchema {

    public static loadXML(str: string) {
        // create xml document
        const doc = XDocument.loadXML(str);
        // get schema element
        const schemaElement = doc.documentElement.selectSingleNode('edmx:DataServices/Schema');
        // de-serialize schema and return
        return XSerializer.deserialize(schemaElement, EdmSchema);
    }

    public EntityType: EdmEntityType[] = [];
    public EntityContainer = new EdmEntityContainer();
    public Action: EdmAction[] = [];
    public Function: EdmFunction[] = [];
    public readXml(node: XNode) {
        this.EntityType = node.selectNodes('EntityType').map((x) => {
            return XSerializer.deserialize(x, EdmEntityType);
        });
        const entityContainerNode = node.selectSingleNode('EntityContainer');
        if (entityContainerNode) {
            this.EntityContainer = XSerializer.deserialize(entityContainerNode, EdmEntityContainer);
        }
        this.Action = node.selectNodes('Action').map((x) => {
            return XSerializer.deserialize(x, EdmAction);
        });
        this.Function = node.selectNodes('Function').map((x) => {
            return XSerializer.deserialize(x, EdmFunction);
        });
    }

    static entityType(name?: string) {
        return (target: EntityConstructor<any>) => {
            // get entity type
            const entityType = target as unknown as EntityTypeAnnotation;
            // use name or target entity name
            const entityName = name || target.name;
            // assign entity type annotation
            entityType.Entity = Object.assign({
                name: entityName
            });
        }
    }

    static entitySet(name: string) {
        return (target: EntityConstructor<any>) => {
            // get entity type
            const entitySet = target as unknown as EntitySetAnnotation;
            // assign entity type annotation
            entitySet.EntitySet = Object.assign({
                name
            });
        }
    }

}

/**
 * Represents entity container element of an OData service metadata document
 */
export class EdmEntityContainer {
    public EntitySet: EdmEntitySet[] = [];
    public readXml(node: XNode) {
        this.EntitySet = node.selectNodes('EntitySet').map((x) => {
            return XSerializer.deserialize(x, EdmEntitySet);
        });
    }
}

export class EdmProcedure {
    public Name: string;
    public IsBound = true;
    public Parameter: EdmParameter[] = [];
    public ReturnType: EdmReturnType;
    public readXml(node: XNode) {
        this.Name = node.getAttribute('Name');
        this.IsBound = node.getAttribute('IsBound') === 'true';
        this.Parameter = node.selectNodes('Parameter').map((x) => {
            return XSerializer.deserialize(x, EdmParameter);
        });
        const returnTypeNode = node.selectSingleNode('ReturnType');
        if (returnTypeNode) {
            this.ReturnType = XSerializer.deserialize(returnTypeNode, EdmReturnType);
        } else {
            this.ReturnType = null;
        }
    }
}

/**
 * An OData function element
 */
export class EdmFunction extends EdmProcedure {
    //
}

/**
 * An OData action element
 */
export class EdmAction extends EdmProcedure {
    //
}

/**
 * Represents a parameter of an OData action or function
 */
export class EdmParameter {
    public Name: string;
    public Type: string;
    public Nullable = true;
    public readXml(node: XNode) {
        this.Name = node.getAttribute('Name');
        this.Type = node.getAttribute('Type');
        if (node.hasAttribute('Nullable')) {
            this.Nullable = node.getAttribute('Nullable') === 'true';
        }
    }
}

/**
 * Represents the result of an OData action or function
 */
export class EdmReturnType {
    public Type: string;
    public Nullable = true;
    public readXml(node: XNode) {
        this.Type = node.getAttribute('Type');
        if (node.hasAttribute('Nullable')) {
            this.Nullable = node.getAttribute('Nullable') === 'true';
        }
    }
}

/**
 * Represents a property of an entity type
 */
export class EdmProperty {
    public Name: string;
    public Type: string;
    public Nullable = true;
    public Immutable = false;
    public Description: string;
    public LongDescription: string;
    public Computed = false;
    public Annotations: EdmAnnotation[] = [];
    constructor() {
        //
    }
    public readXml(node: XNode) {
        this.Name = node.getAttribute('Name');
        this.Type = node.getAttribute('Type');
        if (node.hasAttribute('Nullable')) {
            this.Nullable = node.getAttribute('Nullable') === 'true';
        }
        const immutable = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.Immutable"]');
        if (immutable) {
            this.Immutable = (immutable.getAttribute('Tag') === 'true') || (immutable.getAttribute('Bool') === 'true');
        }
        const computed = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.Computed"]');
        if (computed) {
            this.Computed = (computed.getAttribute('Tag') === 'true') || (computed.getAttribute('Bool') === 'true');
        }
        const description = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.Description"]');
        if (description) {
            this.Description = description.getAttribute('String');
        }
        const longDescription = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.LongDescription"]');
        if (longDescription) {
            this.LongDescription = longDescription.getAttribute('String');
        }
        this.Annotations = node.selectNodes('Annotation').map((annotationNode) => {
            return XSerializer.deserialize(annotationNode, EdmAnnotation);
        });
    }
}

/**
 * Represents a navigation property of an entity type
 */
export class EdmNavigationProperty {
    public Name: string;
    public Type: string;
    public Immutable = false;
    public Description: string;
    public LongDescription: string;
    public Computed = false;
    public Annotations: EdmAnnotation[] = [];
    constructor() {
        //
    }
    public readXml(node: XNode) {
        this.Name = node.getAttribute('Name');
        this.Type = node.getAttribute('Type');
        const immutable = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.Immutable"]');
        if (immutable) {
            this.Immutable = (immutable.getAttribute('Tag') === 'true') || (immutable.getAttribute('Bool') === 'true');
        }
        const computed = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.Computed"]');
        if (computed) {
            this.Computed = (computed.getAttribute('Tag') === 'true') || (computed.getAttribute('Bool') === 'true');
        }
        const description = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.Description"]');
        if (description) {
            this.Description = description.getAttribute('String');
        }
        const longDescription = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.LongDescription"]');
        if (longDescription) {
            this.LongDescription = longDescription.getAttribute('String');
        }
        this.Annotations = node.selectNodes('Annotation').map((annotationNode) => {
            return XSerializer.deserialize(annotationNode, EdmAnnotation);
        });
    }
}

/**
 * Represents the primary of an entity type
 */
export class EdmKey {
    public PropertyRef: EdmPropertyRef[] = [];
    public readXml(node: XNode) {
        this.PropertyRef = node.selectNodes('PropertyRef').map((x) => {
            return XSerializer.deserialize(x, EdmPropertyRef);
        });
    }
}

/**
 * A property reference of an entity type
 */
export class EdmPropertyRef {
    public Name: string;
    public readXml(node: XNode) {
        this.Name = node.getAttribute('Name');
    }
}

/**
 * Represents an OData entity type
 */
export class EdmEntityType {
    public Name: string;
    public BaseType: string;
    public OpenType: boolean;
    public Key: EdmKey;
    public Property: EdmProperty[] = [];
    public NavigationProperty: EdmNavigationProperty[] = [];
    public ImplementsType: string;
    public Annotations: EdmAnnotation[] = [];
    constructor() {
        this.OpenType = true;
    }
    public readXml(node: XNode) {
        this.Name = node.getAttribute('Name');
        this.OpenType = node.getAttribute('OpenType') === 'true';
        this.BaseType = node.getAttribute('BaseType');
        const keyNode = node.selectSingleNode('Key');
        if (keyNode) {
            this.Key = XSerializer.deserialize(keyNode, EdmKey);
        }
        this.Property = node.selectNodes('Property').map((x) => {
            return XSerializer.deserialize(x, EdmProperty);
        });
        this.NavigationProperty = node.selectNodes('NavigationProperty').map((x) => {
            return XSerializer.deserialize(x, EdmNavigationProperty);
        });
        // get implements annotation
        const implementsAnnotation = node.selectSingleNode('Annotation[@Term="DataModel.OData.Core.V1.Implements"]');
        if (implementsAnnotation) {
            this.ImplementsType = implementsAnnotation.getAttribute('String');
        }
        this.Annotations = node.selectNodes('Annotation').map((annotationNode) => {
            return XSerializer.deserialize(annotationNode, EdmAnnotation);
        });
    }

}

/**
 * An entity set of an OData service container
 */
export class EdmEntitySet {
    public Name: string;
    public EntityType: string;
    public ResourcePath: string;
    constructor() {
        //
    }
    public readXml(node: XNode) {
        this.Name = node.getAttribute('Name');
        this.EntityType = node.getAttribute('EntityType');
        // get resource path
        const resourcePathNode = node.selectSingleNode('Annotation[@Term="Org.OData.Core.V1.ResourcePath"]');
        if (resourcePathNode) {
            this.ResourcePath = resourcePathNode.getAttribute('String');
        }
    }

}

export class EdmAnnotation {
    public Term: string;
    public String: string;
    public Tag: any;
    public Bool: any;
    constructor() {
        //
    }
    public readXml(node: XNode) {
        this.Term = node.getAttribute('Term');
        if (node.hasAttribute('String')) {
            this.String = node.getAttribute('String');
        }
        if (node.hasAttribute('Tag')) {
            this.Tag = node.getAttribute('Tag');
        }
        if (node.hasAttribute('Bool')) {
            this.Bool = (node.getAttribute('Bool') === 'true');
        }
    }
}

